# Brain Log: the blog at rydr.info/blog

This folder holds the generator. The built site lives in `../blog/` and is committed, so GitHub Pages serves it with no extra setup.

## Publishing a note

1. In Obsidian, add `publish: true` to the note's frontmatter. Nothing without it is ever published.
2. From this folder, pull published notes out of your vault:
   ```bash
   python3 sync.py "/path/to/Obsidian Vault"
   ```
3. Build:
   ```bash
   python3 build.py
   ```
4. Commit and push from the repo root:
   ```bash
   git add brainlog blog && git commit -m "brain log: new entry" && git push
   ```

`sync.py` and `build.py` both stop with a report if a published note looks like it contains a password, token, private IP, or email.

First time only: `pip install -r requirements.txt`

## Folders

Entries are grouped into folders on the home page. The folders and their order are set in `site.json` under `"folders"`:

* Projects
* AGS Internship
* System Followups
* Google Cybersecurity Course Notes

Inside a folder, entries are numbered by `order`, and every entry gets Previous / Next links, so a folder reads like a series. A note with a `folder:` that isn't in `site.json` gets a new folder at the end.

## Frontmatter

```yaml
---
publish: true            # required
title: GitHub over SSH   # defaults to the file name
folder: Projects         # which folder it goes in
order: 4                 # position inside the folder (01, 02, ...)
date: 2026-03-19         # optional; leave it out and no date is shown
description: One line shown on the home page and at the top of the entry.
draft: true              # optional, skipped unless build.py --drafts
allow_private_ips: true  # optional, for teaching notes with example IPs
scan_allow: ["git@github.com"]  # optional, exact values the secret check should ignore
---
```

Wikilinks, image embeds, callouts, `==highlights==`, `- [ ]` checklists, tables, and code blocks all work. Links to unpublished notes turn into plain text, and `%% comments %%` are stripped.

## Preview locally

From the repo root:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 for the main site and http://localhost:8000/blog/ for Brain Log.

## Config

`site.json` holds the title, tagline, links, and `base` (the URL path the blog lives under). To move the blog to its own subdomain later, set `base` to `""`, set `url`, and add `"domain": "blog.rydr.info"`.

Visual style inspired by Brad Woods' digital garden (garden.bradwoods.io). Fonts are IBM Plex under the SIL Open Font License (see `static/fonts`).
