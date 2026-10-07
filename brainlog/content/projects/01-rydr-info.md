---
publish: true
title: "rydr.info: GitHub Pages, a Custom Domain, and a DNS Rabbit Hole"
folder: Projects
order: 1
scan_allow: ["100.100.100.100"]
date: 2026-04-20
description: How I put a hand-written HTML/CSS/JS site on GitHub Pages under my own domain, and the two DNS problems on my own network that made it look broken.
---

## What this is

rydr.info is my personal site. It is plain HTML, CSS, and JavaScript with no framework, hosted for free on GitHub Pages, on a domain I bought from Spaceship. This walks through the whole setup in the order I did it, including the part where the site was live for everyone except me.

## The stack

| Layer | Tool |
| --- | --- |
| Hosting | GitHub Pages |
| Registrar | Spaceship |
| Code | HTML + CSS + JS, no framework |
| Fonts | Syne + Space Mono |
| Local dev | VS Code + the Live Server extension |

## Step 1: Buy the domain

I registered `rydr.info` on Spaceship. By default it uses Spaceship's own nameservers (`launch1.spaceship.net` and `launch2.spaceship.net`), which is where you add DNS records later.

## Step 2: Build the site and push it

Build the site locally, then push it to a public GitHub repo. Mine is `rayedrah/rydr.info`, with `index.html` at the repo root.

Then in the repo: **Settings → Pages → Deploy from a branch → `main` / root**. The site goes live at `username.github.io` first.

## Step 3: Point the domain at GitHub

In Spaceship's **Advanced DNS**, add GitHub Pages' four IPs for the root, plus a `CNAME` for `www`:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `rayedrah.github.io` |

Back in **Settings → Pages**, enter `rydr.info` as the custom domain and save. Once GitHub verifies it, turn on **Enforce HTTPS**.

> [!tip] GitHub's DNS check is slow
> It kept showing `InvalidDNSError` for a while after the records had already propagated. The site worked anyway. Wait and retry.

## Step 4: Check propagation from outside your network

Ask a public resolver directly, so your own network can't lie to you:

```bash
dig rydr.info @8.8.8.8
```

If it returns the four GitHub IPs, the internet can see your site.

## The rabbit hole: live for everyone but me

`dig` returned the right IPs, but my browser kept showing `DNS_PROBE_FINISHED_NXDOMAIN`. There were two separate causes, both on my side.

### Problem 1: Tailscale took over my DNS

I run Tailscale, and it had rewritten `/etc/resolv.conf` to use its own resolver:

```
nameserver 100.100.100.100   ← Tailscale DNS
```

The quick fix was pointing the system back at a public resolver:

```bash
sudo bash -c 'echo -e "nameserver 8.8.8.8\nnameserver 8.8.4.4" > /etc/resolv.conf'
```

### Problem 2: Pi-hole cached the "doesn't exist" answer

My home network runs RaspAP (a Raspberry Pi hotspot) with Pi-hole as the DNS server. Pi-hole had looked up `rydr.info` before the records existed, so it cached `NXDOMAIN` and kept serving it.

Restart its DNS service to clear the cache:

```bash
sudo systemctl restart pihole-FTL
```

Or from the RaspAP web UI: **DHCP → Restart dnsmasq**.

> [!note]
> `pihole restartdns` didn't work for me from kitty because of the `xterm-kitty` terminal type. The `systemctl` command above works everywhere.

## Step 5: Favicon and resume

I generated a favicon pack at favicon.io, put the files in an `icon/` folder, and linked them in `<head>`:

```html
<link rel="apple-touch-icon" sizes="180x180" href="icon/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="icon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="icon/favicon-16x16.png">
<link rel="icon" type="image/x-icon" href="icon/favicon.ico">
```

The resume is just `resume.pdf` in the repo root, linked from a button. Updating it means replacing the file, no code changes.

## Later: moving DNS to Cloudflare

When I needed subdomains served from my own machine (like the CTF platform from my internship), I moved `rydr.info`'s nameservers from Spaceship to Cloudflare so Cloudflare Tunnel could route them. The main site still lives on GitHub Pages; only the DNS moved.

## Troubleshooting

| Issue | Cause | Fix |
| --- | --- | --- |
| `DNS_PROBE_FINISHED_NXDOMAIN` in the browser | Tailscale rewrote `/etc/resolv.conf` | Set `8.8.8.8` in `resolv.conf` |
| GitHub DNS check keeps failing | GitHub's verifier lags | Wait and retry |
| Domain still "doesn't exist" at home | Pi-hole cached `NXDOMAIN` | Restart `pihole-FTL` or dnsmasq |
| Favicon not showing locally | Browser cache | Hard refresh (`Ctrl+Shift+R`) |
| "Conflicting records" warning in Spaceship | Duplicate A records | Records were correct, dismissed it |
