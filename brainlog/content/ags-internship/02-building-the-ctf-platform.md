---
publish: true
title: Building a 50-Challenge CTF Platform for a National Cyber Drill
folder: AGS Internship
order: 2
description: How I built, branded, and ran the CTF platform for the 2nd Agile Cyber Drill 2026 with CTFd, Docker Compose, a Flask challenge backend, and Cloudflare Tunnel.
---

## Context

For the 2nd Agile Cyber Drill 2026, a national cybersecurity capacity-building initiative, I built the CTF platform participants competed on: 50 challenges across six categories, served from subdomains of my own domain.

> [!note] No spoilers
> This covers how the platform was built and run. Flags, solutions, and challenge internals stay private, since the challenges may be reused.

## The stack

| Piece | What it does |
| --- | --- |
| **CTFd** | The CTF platform: accounts, challenges, scoring, admin panel |
| **Docker Compose** | Runs CTFd, MariaDB, Redis, Nginx, and the challenge containers together |
| **Flask + gunicorn** | A custom backend for challenges that need live, interactive endpoints |
| **Cloudflare Tunnel** | Exposes it all publicly with no open ports on the host |

Two public hostnames:

- `agsctf.rydr.info` → CTFd
- `webchal.rydr.info` → the Flask challenge backend

## Step 1: Move DNS to Cloudflare

My main site's DNS lived at Spaceship. To let Cloudflare Tunnel create and route subdomains, I moved `rydr.info`'s nameservers to Cloudflare. The main site still runs on GitHub Pages, and only the DNS moved.

## Step 2: Bring up CTFd with Docker Compose

```bash
docker compose up -d      # start everything
docker compose ps         # check status
docker compose logs -f    # follow logs
docker compose down       # stop
```

Make sure Docker Desktop is running first, then confirm `http://localhost:8000` works **before** exposing anything publicly.

On a fresh install, the first account created in CTFd's setup wizard becomes the admin.

## Step 3: Expose it with Cloudflare Tunnel

```bash
cloudflared tunnel run --url http://localhost:8000 agsctf
```

A second route handles `webchal.rydr.info` for the Flask backend. Then the platform is reachable from any device.

> [!warning] Laptop-hosted means laptop-dependent
> During the drill, the platform ran from my Mac. Mac asleep or tunnel stopped means site down. The planned fix is a clean install on a real server from a fresh repo with no secrets in it.

## Step 4: Plan the challenge mix

| Category | Count |
| --- | --- |
| Web | 14 |
| Crypto | 12 |
| Forensics | 10 |
| Misc / security trivia | 8 |
| Reverse engineering | 4 |
| OSINT | 2 |

Points scale from 50 for warm-ups to 300 for the capstones. Most challenges were sized for 10 to 20 minutes, so beginners could score early and stay engaged, while the harder ones built on skills from the easier ones in the same category.

## Step 5: Build in small batches

I didn't write all 50 and then test. Each category was built in batches of two or three challenges:

1. Add the challenge's routes to the Flask backend (or its files, for offline challenges).
2. Rebuild the containers.
3. Write the `challenge.yml` for CTFd.
4. Solve it myself from scratch before moving on.

Solving every challenge myself is what caught the bugs below before participants did. It also produced a full solution guide for all six categories, converted to a 24-page PDF with `pandoc` + `wkhtmltopdf` for the organizers.

## Step 6: Brand it

CTFd lets you inject CSS through **Admin → Config → Theme Header**, so I themed it in the client's colors without forking CTFd:

| Color | Hex | Use |
| --- | --- | --- |
| Navy | `#1a3a6b` | primary brand color |
| Orange | `#f5891f` | accents and buttons |
| Black | `#0a0a0a` | background |

> [!important] The theme isn't in git
> CTFd stores theme settings in its own database, not in your repo. A fresh install or a database wipe loses it. Keep a copy of the CSS snippet somewhere outside CTFd.

## Bugs I hit, and what they taught me

**The admin login broke after a domain migration.** CTFd's `Users` model has a `@validates("password")` decorator that hashes any value assigned to `.password`. I had called `hash_password()` myself first, so the password got hashed twice and no longer matched. The fix, in the Flask shell: assign the **plain text** password to `user.password` and let CTFd hash it once.

**A crypto challenge was impossible to solve.** In one RSA challenge, the plaintext encoded to a number larger than the modulus `n`. RSA only works when the message is smaller than `n`, so no correct answer could ever come out. Lesson: check your challenge's math by solving it, not just by generating it.

**Small inconsistencies add up.** A few challenges used the wrong flag prefix, some descriptions had stray backslash escapes that broke links, and 47 `challenge.yml` files still said "Your Name" as the author. All fixed with a bulk pass, but a quick lint step before importing would have caught them.

**Reverse engineering binaries need the right OS.** The RE challenges were Linux x86-64 ELF binaries, which don't run natively on macOS. Test them in a Linux Docker container.

**Long test scripts should show progress.** Testing scripts that run against the live tunnel can look frozen with no output. Print a progress line so you can tell "working" from "hung."

## Scaling notes for next time

- CTFd's default SQLite is fine for small test runs. For a real concurrent event, use a proper database server (MySQL/MariaDB), as the Compose stack does.
- Tune gunicorn's worker count for the number of people you expect to be playing at once.
- Host it on a real server, not a laptop.
