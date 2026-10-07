#!/usr/bin/env python3
"""Copy published notes from your Obsidian vault into ./content.

Only notes with `publish: true` are copied, plus the images they embed.
Nothing else from the vault ever lands in this repo, so private notes
never reach GitHub. The same secret check as build.py runs first.

Usage:
    python3 sync.py ~/path/to/Obsidian\\ Vault
"""

import re
import shutil
import sys
from pathlib import Path

import build

ROOT = Path(__file__).resolve().parent
CONTENT = ROOT / "content"


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    b = build.Builder(sys.argv[1], ROOT / "_unused")
    b.collect()  # exits with a report if a published note looks like it has secrets
    if CONTENT.exists():
        shutil.rmtree(CONTENT)
    (CONTENT / "attachments").mkdir(parents=True)
    copied_media = 0
    for post in b.posts:
        rel = post["src"].relative_to(b.vault.root)
        dest = CONTENT / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(post["src"], dest)
        refs = re.findall(r"!\[\[([^\]|#]+)", post["body"])
        refs += [Path(r.replace("%20", " ")).name
                 for r in re.findall(r"!\[[^\]]*\]\(([^)\s]+)\)", post["body"]) if not r.startswith("http")]
        for ref in refs:
            f = b.vault.find(ref.strip())
            if f and f.suffix.lower() != ".md":
                shutil.copy2(f, CONTENT / "attachments" / f.name)
                copied_media += 1
    print(f"Synced {len(b.posts)} published note(s) and {copied_media} attachment(s) into {CONTENT}")


if __name__ == "__main__":
    main()
