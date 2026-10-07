#!/usr/bin/env python3
"""Build Brain Log (rydr.info/blog) from Obsidian notes.

Only notes with `publish: true` in their frontmatter are built.
The build stops if a published note looks like it contains a secret.

Usage:
    python3 build.py                     # reads ./content, writes ../blog
    python3 build.py --vault ~/Obsidian  # reads straight from your vault
"""

import argparse
import datetime as dt
import html
import json
import math
import re
import shutil
import sys
from pathlib import Path

import markdown
import yaml
from pygments.formatters import HtmlFormatter

ROOT = Path(__file__).resolve().parent
SITE = json.loads((ROOT / "site.json").read_text())
BASE = SITE.get("base", "").rstrip("/")  # e.g. "/blog" when served at rydr.info/blog
ROOT_LINK = re.compile(r'(href|src)="/(?!/)')

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"}
FENCE_RE = re.compile(r"^(```|~~~)")
# old garden-style names still work in frontmatter
STATUS_ALIASES = {"seedling": "spark", "planted": "logged", "tended": "revised", "evergreen": "core", "decay": "fading"}
BARE_URL = re.compile(r"""(?<![("'<=\]\w/])(https?://[^\s<>)\]"']+[^\s<>)\]"'.,;:!?])""")


# ---------------------------------------------------------------- helpers

def slugify(text):
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[\s_-]+", "-", text).strip("-") or "post"


def split_frontmatter(raw):
    if raw.startswith("---"):
        end = raw.find("\n---", 3)
        if end != -1:
            meta = yaml.safe_load(raw[3:end]) or {}
            body = raw[end + 4:].lstrip("\n")
            return (meta if isinstance(meta, dict) else {}), body
    return {}, raw


def as_list(value):
    if value is None:
        return []
    if isinstance(value, str):
        return [v.strip() for v in value.split(",") if v.strip()]
    return [str(v) for v in value]


def as_date(value, fallback):
    if isinstance(value, dt.datetime):
        return value.date()
    if isinstance(value, dt.date):
        return value
    if isinstance(value, str):
        try:
            return dt.date.fromisoformat(value.strip()[:10])
        except ValueError:
            pass
    return fallback


# ------------------------------------------------------------ secret scan

SECRET_RULES = [
    ("password-like field", re.compile(r"(?i)\b(pass(word)?|passwd|pwd|gitpass|pin)\s*[:=]\s*\S")),
    ("GitHub token", re.compile(r"\b(ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{10,}")),
    ("API key", re.compile(r"\b(sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|tskey-[A-Za-z0-9-]+)")),
    ("private key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("private / Tailscale IP", re.compile(
        r"\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}"
        r"|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3})\b")),
    ("email address", re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")),
]
EMAIL_ALLOW = {"git@github.com"}


def scan_for_secrets(path, body, meta):
    allow_ips = bool(meta.get("allow_private_ips"))
    allow = set(as_list(meta.get("scan_allow")))
    problems = []
    for n, line in enumerate(body.splitlines(), 1):
        for label, rule in SECRET_RULES:
            if label.startswith("private / Tailscale") and allow_ips:
                continue
            for m in rule.finditer(line):
                hit = m.group(0)
                if hit in EMAIL_ALLOW or hit in allow:
                    continue
                if any(a and a in line for a in allow):
                    continue
                masked = hit[:4] + "…" if len(hit) > 4 else "…"
                problems.append(f"  {path}:{n}  {label}  ({masked})")
    return problems


# ------------------------------------------------------- obsidian -> md

def protect_code(body):
    """Split body into (is_code, text) chunks so rewrites skip code."""
    chunks, buf, in_code = [], [], False
    for line in body.splitlines(keepends=True):
        if FENCE_RE.match(line.lstrip()):
            if not in_code:
                if buf:
                    chunks.append((False, "".join(buf)))
                buf, in_code = [line], True
            else:
                buf.append(line)
                chunks.append((True, "".join(buf)))
                buf, in_code = [], False
            continue
        buf.append(line)
    if buf:
        chunks.append((in_code, "".join(buf)))
    return chunks


def fix_block_spacing(text):
    """Obsidian lets lists/tables/headings follow text without a blank line;
    Python-Markdown doesn't. Insert the blank line."""
    out = []
    block_start = re.compile(r"^\s{0,3}([-*+]\s|\d+[.)]\s|\||#{1,6}\s|>)")
    for line in text.split("\n"):
        if out and out[-1].strip() and block_start.match(line):
            prev = out[-1]
            same_kind = (block_start.match(prev) or prev.startswith(("    ", "\t")))
            if not same_kind:
                out.append("")
        out.append(line)
    return "\n".join(out)


CALLOUT_ICONS = {
    "note": "i", "info": "i", "tip": "*", "hint": "*", "important": "!",
    "warning": "!", "caution": "!", "danger": "x", "error": "x", "bug": "#",
    "example": ">", "quote": '"', "success": "+", "check": "+", "done": "+",
    "question": "?", "faq": "?", "abstract": "=", "summary": "=", "todo": "o",
}


def convert_callouts(text, render):
    lines = text.split("\n")
    out, i = [], 0
    head = re.compile(r"^>\s*\[!(\w+)\][+-]?\s*(.*)$")
    while i < len(lines):
        m = head.match(lines[i])
        if not m:
            out.append(lines[i])
            i += 1
            continue
        kind, title = m.group(1).lower(), m.group(2).strip()
        body, i = [], i + 1
        while i < len(lines) and lines[i].startswith(">"):
            body.append(re.sub(r"^>\s?", "", lines[i]))
            i += 1
        # Obsidian often packs title + text on one line; split at first sentence.
        if not body and title:
            parts = re.split(r"(?<=[a-z0-9`)])\s+(?=[A-Z])", title, maxsplit=1)
            if len(parts) == 2 and len(parts[0]) < 60:
                title, body = parts[0], [parts[1]]
        title = title or kind.capitalize()
        inner = render("\n".join(body)) if body else ""
        icon = CALLOUT_ICONS.get(kind, "i")
        out.append("")
        out.append(
            f'<aside class="callout callout-{html.escape(kind)}">'
            f'<div class="callout-title"><span class="callout-icon">{html.escape(icon)}</span>'
            f"{render(title, inline=True)}</div>"
            f'<div class="callout-body">{inner}</div></aside>'
        )
        out.append("")
    return "\n".join(out)


class Vault:
    def __init__(self, root):
        self.root = Path(root).expanduser().resolve()
        self.files = {}
        for p in self.root.rglob("*"):
            if p.is_file() and ".obsidian" not in p.parts and ".trash" not in p.parts:
                self.files.setdefault(p.name.lower(), p)
                if p.suffix.lower() == ".md":
                    self.files.setdefault(p.stem.lower(), p)

    def find(self, name):
        name = name.strip().split("/")[-1]
        return self.files.get(name.lower()) or self.files.get((name + ".md").lower())


class Builder:
    def __init__(self, vault_dir, out_dir, include_drafts=False):
        self.vault = Vault(vault_dir)
        self.out = Path(out_dir)
        self.include_drafts = include_drafts
        self.posts = []
        self.by_note = {}
        self.assets = {}

    # ---- discovery
    def collect(self):
        problems = []
        for p in sorted(self.vault.root.rglob("*.md")):
            if ".obsidian" in p.parts or ".trash" in p.parts:
                continue
            meta, body = split_frontmatter(p.read_text(encoding="utf-8", errors="replace"))
            if meta.get("publish") is not True:
                continue
            if meta.get("draft") and not self.include_drafts:
                continue
            body = re.sub(r"%%.*?%%", "", body, flags=re.S)  # Obsidian comments stay private
            rel = p.relative_to(self.vault.root)
            problems += scan_for_secrets(rel, body, meta)
            title = str(meta.get("title") or p.stem)
            post = {
                "src": p,
                "meta": meta,
                "body": body,
                "title": title,
                "slug": slugify(str(meta.get("slug") or title)),
                "date": as_date(meta.get("date"), dt.date.fromtimestamp(p.stat().st_mtime)),
                "tags": [t.lstrip("#") for t in as_list(meta.get("tags"))],
                "description": str(meta.get("description") or ""),
                "category": str(meta.get("category") or (as_list(meta.get("tags")) or ["Misc"])[0]).strip(),
                "status": STATUS_ALIASES.get(str(meta.get("status") or "logged").lower(),
                                             str(meta.get("status") or "logged").lower()),
                "audience": str(meta.get("audience") or ""),
            }
            post["updated"] = as_date(meta.get("updated"), post["date"])
            self.posts.append(post)
            self.by_note[p.stem.lower()] = post
            for alias in as_list(meta.get("aliases")):
                self.by_note[alias.lower()] = post
        if problems:
            print("\nBuild stopped: these published notes look like they contain secrets.\n"
                  "Remove them, or allow a known-safe value with `scan_allow:` in the note's frontmatter.\n",
                  file=sys.stderr)
            print("\n".join(problems), file=sys.stderr)
            sys.exit(1)
        slugs = {}
        for post in self.posts:
            if post["slug"] in slugs:
                post["slug"] += "-" + str(post["date"])
            slugs[post["slug"]] = post
        self.posts.sort(key=lambda x: (x["date"], x["title"]), reverse=True)

    # ---- rendering
    def asset_url(self, path):
        if path not in self.assets:
            name = slugify(path.stem) + path.suffix.lower()
            taken = set(self.assets.values())
            base, n = name, 2
            while name in taken:
                name = f"{Path(base).stem}-{n}{path.suffix.lower()}"
                n += 1
            self.assets[path] = name
        return "/media/" + self.assets[path]

    def rewrite_obsidian(self, text):
        def embed(m):
            target, _, opt = m.group(1).partition("|")
            target = target.split("#")[0].strip()
            f = self.vault.find(target)
            if f and f.suffix.lower() in IMAGE_EXT:
                width = f' width="{int(opt)}"' if opt.strip().isdigit() else ""
                alt = html.escape(opt if opt and not opt.strip().isdigit() else Path(target).stem)
                return f'<img src="{self.asset_url(f)}" alt="{alt}" loading="lazy"{width}>'
            if f and f.suffix.lower() == ".pdf":
                return f'[{html.escape(f.stem)} (PDF)]({self.asset_url(f)})'
            return link(m, label_from_target=True)

        def link(m, label_from_target=False):
            target, _, label = m.group(1).partition("|")
            note, _, heading = target.partition("#")
            label = label or (heading if not note else note)
            post = self.by_note.get(note.strip().lower())
            if post:
                anchor = "#" + slugify(heading) if heading else ""
                return f'[{label}](/posts/{post["slug"]}/{anchor})'
            return f'<span class="dead-link">{html.escape(label)}</span>'

        text = re.sub(r"!\[\[([^\]]+)\]\]", embed, text)
        text = re.sub(r"\[\[([^\]]+)\]\]", link, text)

        def md_image(m):
            alt, src = m.group(1), m.group(2)
            if re.match(r"^(https?:)?//", src):
                return m.group(0)
            f = self.vault.find(Path(src.replace("%20", " ")).name)
            return f"![{alt}]({self.asset_url(f)})" if f else m.group(0)

        text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", md_image, text)
        text = re.sub(r"==([^=\n]+)==", r"<mark>\1</mark>", text)
        parts = re.split(r"(`[^`\n]*`)", text)
        for i in range(0, len(parts), 2):
            parts[i] = BARE_URL.sub(r"<\1>", parts[i])
        text = "".join(parts)
        text = re.sub(r"(?<![\w&/#`])#([A-Za-z][\w/-]*)", r'<span class="inline-tag">#\1</span>', text)
        return text

    def md(self, text, inline=False):
        conv = markdown.Markdown(
            extensions=["fenced_code", "tables", "codehilite", "toc", "sane_lists", "nl2br", "attr_list"],
            extension_configs={
                "codehilite": {"css_class": "hl", "guess_lang": False},
                "toc": {"slugify": lambda v, sep: slugify(v), "permalink": False},
            },
        )
        out = conv.convert(text)
        if not inline:
            self.last_toc = getattr(conv, "toc_tokens", [])
        if inline:
            out = re.sub(r"^<p>(.*)</p>$", r"\1", out.strip(), flags=re.S)
        return out

    def render_body(self, body):
        parts = []
        for is_code, chunk in protect_code(body):
            if is_code:
                parts.append(chunk)
            else:
                chunk = self.rewrite_obsidian(fix_block_spacing(chunk))
                chunk = convert_callouts(chunk, self.md)
                parts.append(chunk)
        return self.md("".join(parts))

    # ---- pages
    STATUS_INFO = {
        "spark": "Half-formed idea. Expect gaps.",
        "logged": "Written up, not revisited yet.",
        "revised": "Revisited and kept current.",
        "core": "Stable reference I keep coming back to.",
        "fading": "Probably out of date.",
    }

    def page(self, title, content, description="", path="/", crumbs=None):
        nav_links = "".join(
            f'<a href="{html.escape(link["href"])}">{html.escape(link["label"])}</a>' for link in SITE["nav"]
        )
        full_title = title if title == SITE["title"] else f"{title} | {SITE['title']}"
        desc = html.escape(description or SITE["description"])
        crumb_html = ""
        if crumbs:
            items = [f'<a href="/">{html.escape(SITE["short"])}</a>']
            for label, href in crumbs:
                items.append(f'<a href="{href}">{html.escape(label)}</a>' if href else f"<span>{html.escape(label)}</span>")
            crumb_html = '<nav class="crumbs" aria-label="Breadcrumb">' + '<i>/</i>'.join(items) + "</nav>"
        return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(full_title)}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{html.escape(full_title)}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{SITE['url']}{path}">
<meta name="theme-color" content="#f1efe8">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="{html.escape(SITE['title'])}" href="/rss.xml">
<link rel="preload" href="/fonts/ibm-plex-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/style.css">
<script>try{{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}}catch(e){{}}</script>
</head>
<body>
<header class="bar">
  <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span>{html.escape(SITE['short'])}</a>
  <nav class="navlinks">{nav_links}<button class="theme" type="button" aria-label="Toggle dark mode" onclick="toggleTheme()">◐</button></nav>
</header>
{crumb_html}
{content}
<footer class="foot">
  <div class="foot-inner">
    <span>© {dt.date.today().year} {html.escape(SITE['author'])}</span>
    <span class="foot-links">{"".join(f'<a href="{html.escape(l["href"])}">{html.escape(l["label"])}</a>' for l in SITE["footer"])}</span>
  </div>
</footer>
<script>
function toggleTheme(){{var d=document.documentElement.classList.toggle("dark");try{{localStorage.setItem("theme",d?"dark":"light")}}catch(e){{}}}}
</script>
</body>
</html>
"""

    @staticmethod
    def fmt(d):
        return d.strftime("%b %Y")

    def status_pill(self, status):
        return f'<span class="status status-{slugify(status)}">{html.escape(status)}</span>'

    def tree(self, posts, current=None):
        rows = []
        for i, p in enumerate(posts):
            branch = "└──" if i == len(posts) - 1 else "├──"
            here = ' aria-current="page" class="row here"' if current is p else ' class="row"'
            rows.append(
                f'<li{here}><span class="branch" aria-hidden="true">{branch}</span>'
                f'<a href="/posts/{p["slug"]}/">{html.escape(p["title"])}</a>'
                f'<span class="dots" aria-hidden="true"></span>{self.status_pill(p["status"])}'
                f'<time>{self.fmt(p["date"])}</time></li>'
            )
        return '<ul class="tree">' + "".join(rows) + "</ul>"

    def categories(self):
        cats = {}
        for p in self.posts:
            cats.setdefault(p["category"], []).append(p)
        return dict(sorted(cats.items(), key=lambda kv: kv[0].lower()))

    def toc_html(self, tokens, depth=0):
        if not tokens:
            return ""
        items = ""
        for t in tokens:
            items += f'<li><a href="#{t["id"]}">{html.escape(html.unescape(re.sub(r"<[^>]+>", "", t["name"])))}</a>'
            if depth < 1:
                items += self.toc_html(t.get("children", []), depth + 1)
            items += "</li>"
        return f"<ol>{items}</ol>"

    def write(self, rel, text):
        if rel.endswith(".html") and BASE:
            text = ROOT_LINK.sub(lambda m: f'{m.group(1)}="{BASE}/', text)
        dest = self.out / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text, encoding="utf-8")

    def build(self):
        self.collect()
        if self.out.exists():
            shutil.rmtree(self.out)
        self.out.mkdir(parents=True)

        for post in self.posts:
            post["html"] = self.render_body(post["body"])
            post["toc"] = self.last_toc
            words = len(re.sub(r"<[^>]+>", " ", post["html"]).split())
            post["minutes"] = max(1, math.ceil(words / 220))
            if not post["description"]:
                plain = re.sub(r"<[^>]+>", " ", post["html"])
                plain = re.sub(r"\s+", " ", html.unescape(plain)).strip()
                post["description"] = (plain[:157] + "…") if len(plain) > 160 else plain

        cats = self.categories()
        recent = self.posts[:5]
        recent_html = "".join(
            f'<li><a href="/posts/{p["slug"]}/"><span class="r-title">{html.escape(p["title"])}</span>'
            f'<span class="r-desc">{html.escape(p["description"])}</span></a>'
            f'<span class="r-meta">{self.status_pill(p["status"])}<time>{self.fmt(p["date"])}</time></span></li>'
            for p in recent
        )
        sections = "".join(
            f'<section class="cat" id="{slugify(c)}"><h3><span class="idx">{i:02d}</span>{html.escape(c)}'
            f'<span class="count">{len(ps)}</span></h3>{self.tree(ps)}</section>'
            for i, (c, ps) in enumerate(cats.items(), 1)
        )
        legend = "".join(
            f'<li>{self.status_pill(k)}<span>{html.escape(v)}</span></li>' for k, v in self.STATUS_INFO.items()
        )
        home = f"""<main class="home">
  <section class="lockup">
    <div class="lockup-label"><span>fig. 01</span><span>{html.escape(SITE['short'])}</span></div>
    <h1>{html.escape(SITE['hero_title'])}<br><span>{html.escape(SITE['hero_accent'])}</span></h1>
    <p class="lede">{html.escape(SITE['tagline'])}</p>
    <dl class="spec">
      <div><dt>Author</dt><dd>{html.escape(SITE['author'])}</dd></div>
      <div><dt>Entries</dt><dd>{len(self.posts)}</dd></div>
      <div><dt>Last logged</dt><dd>{self.fmt(self.posts[0]['date']) if self.posts else '—'}</dd></div>
    </dl>
  </section>
  <section class="block">
    <h2 class="label">Latest entries</h2>
    <ol class="recent">{recent_html or '<li class="empty">Nothing logged yet.</li>'}</ol>
  </section>
  <section class="block">
    <h2 class="label">All entries</h2>
    <div class="cats">{sections}</div>
  </section>
  <section class="block">
    <h2 class="label">Entry status</h2>
    <ul class="legend">{legend}</ul>
  </section>
</main>"""
        self.write("index.html", self.page(SITE["title"], home))

        tags = {}
        for post in self.posts:
            for t in post["tags"]:
                tags.setdefault(t, []).append(post)

        for post in self.posts:
            tag_links = "".join(f'<a class="tag" href="/tags/{slugify(t)}/">#{html.escape(t)}</a>' for t in post["tags"])
            siblings = cats[post["category"]]
            toc = self.toc_html(post["toc"])
            spec = [("Logged", self.fmt(post["date"])), ("Revised", self.fmt(post["updated"])),
                    ("Status", self.status_pill(post["status"])), ("Read", f'{post["minutes"]} min')]
            if post["audience"]:
                spec.append(("Audience", html.escape(post["audience"])))
            spec_html = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in spec)
            content = f"""<main class="note">
  <header class="note-head">
    <h1>{html.escape(post['title'])}</h1>
    <p class="lede">{html.escape(post['description'])}</p>
    <dl class="spec">{spec_html}</dl>
    <div class="tags">{tag_links}</div>
  </header>
  <div class="note-grid">
    {'<aside class="toc"><h2 class="label">Contents</h2>' + toc + '</aside>' if toc else ''}
    <article class="prose">{post['html']}</article>
  </div>
  <section class="next">
    <h2 class="label">Where to next?</h2>
    <p class="next-cat"><a href="/#{slugify(post['category'])}">{html.escape(post['category'])}</a></p>
    {self.tree(siblings, current=post)}
  </section>
</main>"""
            self.write(f"posts/{post['slug']}/index.html",
                       self.page(post["title"], content, post["description"], f"/posts/{post['slug']}/",
                                 crumbs=[("notes", "/"), (post["category"].lower(), f"/#{slugify(post['category'])}"),
                                         (post["title"].lower(), None)]))

        tag_index = "".join(
            f'<a class="tag big" href="/tags/{slugify(t)}/">#{html.escape(t)} <b>{len(ps)}</b></a>'
            for t, ps in sorted(tags.items())
        )
        self.write("tags/index.html", self.page(
            "Tags", f'<main class="list"><h1 class="page-title">Tags</h1><div class="tagcloud">{tag_index}</div></main>',
            path="/tags/", crumbs=[("tags", None)]))
        for t, ps in tags.items():
            self.write(f"tags/{slugify(t)}/index.html", self.page(
                f"#{t}", f'<main class="list"><h1 class="page-title">#{html.escape(t)}</h1>{self.tree(ps)}</main>',
                path=f"/tags/{slugify(t)}/", crumbs=[("tags", "/tags/"), (t, None)]))

        self.write("404.html", self.page("Not found", '<main class="list"><h1 class="page-title">404</h1>'
                                         '<p class="empty">No entry at this address. <a href="/">Back to the log</a></p></main>'))
        self.write_rss()

        media = self.out / "media"
        media.mkdir(exist_ok=True)
        for src, name in self.assets.items():
            shutil.copy2(src, media / name)

        static = ROOT / "static"
        for f in static.rglob("*"):
            if f.is_file():
                dest = self.out / f.relative_to(static)
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(f, dest)
        pyg = HtmlFormatter(style="default").get_style_defs(".hl")
        pyg_dark = HtmlFormatter(style="monokai").get_style_defs(".dark .hl")
        with open(self.out / "style.css", "a", encoding="utf-8") as fh:
            fh.write("\n/* syntax highlighting */\n" + pyg + "\n" + pyg_dark + "\n")
        if SITE.get("domain"):
            (self.out / "CNAME").write_text(SITE["domain"] + "\n")
        (self.out / ".nojekyll").write_text("")
        print(f"Built {len(self.posts)} post(s), {len(tags)} tag(s), {len(self.assets)} image(s) -> {self.out}")

    def write_rss(self):
        items = "".join(
            f"<item><title>{html.escape(p['title'])}</title>"
            f"<link>{SITE['url']}/posts/{p['slug']}/</link><guid>{SITE['url']}/posts/{p['slug']}/</guid>"
            f"<pubDate>{dt.datetime.combine(p['date'], dt.time()).strftime('%a, %d %b %Y 00:00:00 +0000')}</pubDate>"
            f"<description>{html.escape(p['description'])}</description></item>"
            for p in self.posts
        )
        self.write("rss.xml", f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>'
                              f"<title>{html.escape(SITE['title'])}</title><link>{SITE['url']}</link>"
                              f"<description>{html.escape(SITE['description'])}</description>{items}</channel></rss>")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--vault", default=str(ROOT / "content"), help="folder of notes (your vault, or ./content)")
    ap.add_argument("--out", default=str((ROOT / SITE.get("out", "dist")).resolve()))
    ap.add_argument("--drafts", action="store_true", help="also build notes marked draft: true")
    args = ap.parse_args()
    Builder(args.vault, args.out, args.drafts).build()


if __name__ == "__main__":
    main()
