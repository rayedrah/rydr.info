#!/usr/bin/env python3
"""Build Brain Log (rydr.info/blog) from Obsidian notes.

Notes are grouped into folders (see "folders" in site.json) and ordered
inside each folder with `order:` in the frontmatter.

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
        self.folders = [dict(f, slug=slugify(f["name"]), posts=[]) for f in SITE.get("folders", [])]

    # ---- discovery
    def folder_for(self, name):
        for f in self.folders:
            if f["name"].lower() == name.lower() or f["slug"] == slugify(name):
                return f
        f = {"name": name, "slug": slugify(name), "description": "", "posts": []}
        self.folders.append(f)
        return f

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
            problems += scan_for_secrets(p.relative_to(self.vault.root), body, meta)
            title = str(meta.get("title") or p.stem)
            folder = self.folder_for(str(meta.get("folder") or "Notes"))
            post = {
                "src": p,
                "body": body,
                "title": title,
                "slug": slugify(str(meta.get("slug") or title)),
                "date": as_date(meta.get("date"), None),  # optional; undated entries just hide the date
                "description": str(meta.get("description") or ""),
                "folder": folder,
                "order": float(meta.get("order") or 999),
            }
            self.posts.append(post)
            folder["posts"].append(post)
            self.by_note[p.stem.lower()] = post
            self.by_note[title.lower()] = post
            for alias in as_list(meta.get("aliases")):
                self.by_note[alias.lower()] = post
        if problems:
            print("\nBuild stopped: these published notes look like they contain secrets.\n"
                  "Remove them, or allow a known-safe value with `scan_allow:` in the note's frontmatter.\n",
                  file=sys.stderr)
            print("\n".join(problems), file=sys.stderr)
            sys.exit(1)
        seen = set()
        for post in self.posts:
            if post["slug"] in seen:
                post["slug"] += "-" + post["folder"]["slug"]
            seen.add(post["slug"])
        for f in self.folders:
            f["posts"].sort(key=lambda x: (x["order"], x["date"] or dt.date.min, x["title"]))
            for i, post in enumerate(f["posts"], 1):
                post["part"] = i
        self.folders = [f for f in self.folders if f["posts"]]
        self.posts.sort(key=lambda x: (x["date"] or dt.date.min, x["title"]), reverse=True)

    # ---- rendering
    @staticmethod
    def fmt(d):
        return d.strftime("%b %-d, %Y") if d else ""

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
<meta name="theme-color" content="#f2efe6">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="{html.escape(SITE['title'])}" href="/rss.xml">
<link rel="preload" href="/fonts/ibm-plex-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header class="bar">
  <div class="bar-inner">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span>{html.escape(SITE['short'])}</a>
    <nav class="navlinks">{nav_links}</nav>
  </div>
</header>
{crumb_html}
{content}
<footer class="foot">
  <div class="foot-inner">
    <span>&copy; {dt.date.today().year} {html.escape(SITE['author'])}</span>
    <span class="foot-links">{"".join(f'<a href="{html.escape(l["href"])}">{html.escape(l["label"])}</a>' for l in SITE["footer"])}</span>
  </div>
</footer>
</body>
</html>
"""

    def entry_list(self, posts, numbered=True, current=None):
        rows = []
        for p in posts:
            num = f'<span class="num">{p["part"]:02d}</span>' if numbered else ""
            here = ' class="here" aria-current="page"' if p is current else ""
            desc = f'<span class="e-desc">{html.escape(p["description"])}</span>' if p["description"] and current is None else ""
            when = f'<time>{self.fmt(p["date"])}</time>' if p["date"] else "<time></time>"
            rows.append(
                f'<li{here}>{num}<a href="/posts/{p["slug"]}/"><span class="e-title">{html.escape(p["title"])}</span>{desc}</a>'
                f'{when}</li>'
            )
        return '<ol class="entries">' + "".join(rows) + "</ol>"

    def folder_block(self, f, link_title=True):
        count = len(f["posts"])
        idx = self.folders.index(f)
        name = html.escape(f["name"])
        title = f'<a href="/folders/{f["slug"]}/">{name}</a>' if link_title else name
        desc = f'<p class="f-desc">{html.escape(f.get("description", ""))}</p>' if f.get("description") else ""
        return (f'<section class="module" id="{f["slug"]}">'
                f'<div class="mod-head"><span class="led on" aria-hidden="true"></span>'
                f'<span class="mod-id">DIR {idx + 1:02d}</span>'
                f'<span class="mod-count">{count:02d} {"entry" if count == 1 else "entries"}</span></div>'
                f'<div class="crt crt-mod"><h2>{title}</h2>{desc}</div>'
                f'{self.entry_list(f["posts"])}</section>')

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

        # home: a terminal header, then one module per folder
        dated = [p for p in self.posts if p["date"]]
        latest = dated[0] if dated else (self.posts[0] if self.posts else None)
        play = (f'<a class="key key-play" href="/posts/{latest["slug"]}/"><span aria-hidden="true">&#9654;</span> Latest entry</a>'
                if latest else "")
        home = f"""<main class="wrap">
  <section class="deck">
    <div class="deck-head">
      <span class="plate">{html.escape(SITE['short'])} &middot; terminal BL-1</span>
      <span class="leds" aria-hidden="true"><i class="on"></i><i></i><i></i></span>
    </div>
    <div class="deck-body">
      <div class="crt" role="img" aria-label="Brain Log, {len(self.posts)} entries in {len(self.folders)} folders">
        <div class="crt-row"><span>Sys online</span><span class="rec">&#9679; Live</span></div>
        <div class="crt-title">{html.escape(SITE['hero_title'])}</div>
        <div class="crt-row"><span>{len(self.posts):03d} entries / {len(self.folders):02d} directories</span><span>{self.fmt(latest['date']) if latest and latest['date'] else ''}</span></div>
        <div class="prompt" aria-hidden="true">&gt; select a directory<span class="cursor">_</span></div>
      </div>
      <div class="deck-side">
        <h1 class="sr-only">{html.escape(SITE['hero_title'])}</h1>
        <p class="tagline">{html.escape(SITE['tagline'])}</p>
        <div class="keys">{play}<a class="key" href="#dirs"><span aria-hidden="true">&#8801;</span> Directories</a></div>
      </div>
    </div>
  </section>
  <div class="dirs" id="dirs">
  {"".join(self.folder_block(f) for f in self.folders)}
  </div>
</main>"""
        self.write("index.html", self.page(SITE["title"], home))

        # folder pages
        for f in self.folders:
            body = f'<main class="wrap"><div class="dirs">{self.folder_block(f, link_title=False)}</div></main>'
            self.write(f"folders/{f['slug']}/index.html",
                       self.page(f["name"], body, f.get("description", ""), f"/folders/{f['slug']}/",
                                 crumbs=[(f["name"], None)]))

        # posts
        for post in self.posts:
            f = post["folder"]
            series = f["posts"]
            i = series.index(post)
            prev_p = series[i - 1] if i > 0 else None
            next_p = series[i + 1] if i + 1 < len(series) else None
            pager = '<nav class="pager">'
            pager += (f'<a class="prev key-btn" href="/posts/{prev_p["slug"]}/"><small>&#9664; Prev entry</small>'
                      f'<span>{html.escape(prev_p["title"])}</span></a>') if prev_p else "<span></span>"
            pager += (f'<a class="next key-btn" href="/posts/{next_p["slug"]}/"><small>Next entry &#9654;</small>'
                      f'<span>{html.escape(next_p["title"])}</span></a>') if next_p else "<span></span>"
            pager += "</nav>"
            toc = self.toc_html(post["toc"])
            content = f"""<main class="wrap note">
  <header class="note-head">
    <div class="crt crt-strip">
      <div class="crt-row"><a href="/folders/{f['slug']}/">Dir: {html.escape(f['name'])}</a><span>Entry {post['part']:02d}/{len(series):02d}</span></div>
      <div class="crt-row"><span>{(self.fmt(post['date']) if post['date'] else '&nbsp;')}</span><span>{post['minutes']:02d} min</span></div>
    </div>
    <h1>{html.escape(post['title'])}</h1>
    <p class="lede">{html.escape(post['description'])}</p>
  </header>
  {'<details class="toc"><summary>On this page</summary>' + toc + '</details>' if toc else ''}
  <article class="prose">{post['html']}</article>
  {pager}
  <section class="more">
    <h2>Directory &middot; {html.escape(f['name'])}</h2>
    {self.entry_list(series, current=post)}
  </section>
</main>"""
            self.write(f"posts/{post['slug']}/index.html",
                       self.page(post["title"], content, post["description"], f"/posts/{post['slug']}/",
                                 crumbs=[(f["name"], f"/folders/{f['slug']}/"), (post["title"], None)]))

        self.write("404.html", self.page("Not found", '<main class="wrap"><header class="intro"><h1>404</h1>'
                                         '<p>No entry at this address. <a href="/">Back to the log</a></p></header></main>'))
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
        with open(self.out / "style.css", "a", encoding="utf-8") as fh:
            fh.write("\n/* syntax highlighting */\n" + HtmlFormatter(style="native").get_style_defs(".hl") + "\n")
        if SITE.get("domain"):
            (self.out / "CNAME").write_text(SITE["domain"] + "\n")
        (self.out / ".nojekyll").write_text("")
        print(f"Built {len(self.posts)} entries in {len(self.folders)} folder(s), {len(self.assets)} image(s) -> {self.out}")

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
        text = re.sub(r"(?m)^(\s*[-*+] )\[ \] ", r'\1<input type="checkbox" disabled> ', text)
        text = re.sub(r"(?m)^(\s*[-*+] )\[[xX]\] ", r'\1<input type="checkbox" checked disabled> ', text)
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

    def write_rss(self):
        items = "".join(
            f"<item><title>{html.escape(p['title'])}</title>"
            f"<link>{SITE['url']}/posts/{p['slug']}/</link><guid>{SITE['url']}/posts/{p['slug']}/</guid>"
            + (f"<pubDate>{dt.datetime.combine(p['date'], dt.time()).strftime('%a, %d %b %Y 00:00:00 +0000')}</pubDate>" if p['date'] else "") +
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
