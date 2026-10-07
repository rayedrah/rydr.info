---
publish: true
title: "TRKT: A $0 QR Ticketing and Check-in System on Cloudflare Workers"
folder: Projects
order: 2
date: 2026-07-07
description: A reusable QR ticketing system I run my events on. One Worker file, one KV namespace, no monthly bill, and a check-in race condition I had to design around.
---

## What this is

TRKT is a QR-code ticketing and live check-in system I built for the events I host. I built it once and reuse it for every event. Everything is done from a web dashboard, so running an event never touches the terminal.

What it does:

- Create an event in the browser: fill in a form, upload a guest CSV, done.
- Every guest gets their own QR ticket link.
- Staff scan tickets at the door to check people in live.
- A tabbed dashboard: **The Door**, **Settings**, **Ticket Design**, **Data & Access**.
- Add, edit, remove, and manually check in guests, with undo.
- Custom ticket designs (theme colours or your own HTML/CSS).
- Any extra CSV column becomes a custom field you can put on the ticket.
- CSV export, bulk add, and an arrivals chart.

## Why Cloudflare Workers + KV

The system sits unused for months between events. Free tiers like Supabase and Firebase pause or delete inactive projects, or want a card on file. A Cloudflare Worker never sleeps and never expires: deploy once, come back next year, and it still works.

- **One Worker** (a single JS file) serves every route.
- **One KV namespace** stores every event ever created.
- **Cost:** $0. The free tier gives 100k reads, 1,000 writes, and 1,000 lists per day.
- It runs on Cloudflare, not on my laptop. Laptop off, site still up.

> [!note]
> Only the Worker script gets deployed. There is no static hosting, so files sitting next to it never reach Cloudflare. That's why the favicons are base64-embedded in the code.

## How the data is laid out

| KV key | What it holds |
| --- | --- |
| `cfg:SLUG` | Event settings: name, date, venue, check-in mode, theme, custom fields, password hashes |
| `roster:SLUG` | Every guest, keyed by ticket ID |
| `checkin:SLUG:TICKETID` | One check-in record per guest (high-concurrency mode only) |
| `eventIndex` | The list of events shown on the landing page |

## The interesting problem: two scanners, one lost check-in

My first version stored attendance as a flag inside the single `roster:SLUG` blob. A check-in did **read the blob → modify it → write the whole blob back**.

That breaks with two staff members. If two people scan two *different* guests within about 100ms, both read the same roster, and the second write overwrites the first. One check-in silently disappears.

I tested it: 10 simultaneous scans, and the single-blob design kept only 3.

### The fix: two check-in modes

| Mode | Where attendance lives | Use it when |
| --- | --- | --- |
| **Standard** | A flag in the roster blob | One person is scanning. Cheapest on reads. |
| **High-concurrency** | A separate `checkin:SLUG:TICKETID` key per guest | Several people scan at once. No check-in is ever lost. |

In high-concurrency mode, two scanners write to **different keys**, so they physically can't overwrite each other. Same test: 10 simultaneous scans, all 10 kept.

The mode is chosen when the event is created and can't be changed later.

### The trade-off: reads

In high-concurrency mode, every dashboard refresh has to read every check-in so far. At 500 guests checked in, that's about 502 reads per refresh, **per open dashboard**. The number of scanners doesn't matter; the number of open dashboards does.

So for a big event: scanners stay on the scan page, and only one organizer keeps the dashboard open. That's why the landing page asks "Dashboard or Authorise Scanner?" instead of sending everyone to the dashboard.

## Two separate passwords

- The **dashboard password** protects management: the dashboard, exports, and every editing API.
- The **scanner password** protects check-in. A device authorises once and gets a 30-day cookie.

Neither password opens the other's door. A scanner can't manage the event, and a dashboard login can't check anyone in. Guest ticket pages are never password-protected, since guests need to open them. Both passwords are stored as salted PBKDF2 hashes.

## A timezone bug worth knowing about

Check-in times were originally formatted with `toLocaleTimeString()` **on the Worker**. Workers run in UTC, so a 7:00 AM check-in in Dhaka was recorded as 1:00 AM.

The fix: store a plain epoch timestamp, and let the **browser** format it in the viewer's local time. Sorting by the real timestamp also fixed a bug where string sorting broke across AM/PM.

## Hardening I did before thinking about making it public

- **Password hashing:** moved from unsalted SHA-256 to salted PBKDF2-SHA256 with 100,000 iterations. Old hashes still verify and upgrade the next time the password changes.
- **Rate limiting** on login attempts and event creation.
- **Slug validation:** event slugs are used in KV keys and URLs, so only `a-z0-9-` is allowed.
- **CSV formula-injection guard:** any exported cell starting with `=`, `+`, `-`, or `@` gets a leading `'` so Excel never runs it as a formula.
- **Fixed a stored XSS bug** on the event-creation results page, where guest names and the slug were inserted into `innerHTML` unescaped.

## Running an event with it

1. Go to `/new`.
2. Pick a slug (lowercase letters, numbers, hyphens), name, subtitle, and footer.
3. **Choose the check-in mode.** This is the one decision you can't undo.
4. Set a dashboard password and a scanner password.
5. Upload the guest CSV and submit. You get every guest's ticket link plus the dashboard link.
6. On event day, staff open `/scan?event=SLUG` once to authorise their phones, then scan tickets.

### CSV format

The first row is headers. Only `Name` is required; blank-name rows are skipped.

```
Name,Seat,Meal Preference
John Smith,Table 1,Vegetarian
Jane Doe,Table 2,Chicken
```

Any column beyond `Name`, `Seat`, and `Badge` becomes a custom field, so `Meal Preference` turns into `{{meal_preference}}` for the ticket template. Quote values that contain commas.

## Staying inside the free tier

- **Writes (1,000/day)** are the limit to respect. A check-in, add, edit, or undo is 1 write. Bulk add is 2 writes total, no matter how many guests.
- **Reads** run out from dashboards, not scanners. If reads are exhausted, scans fail, because a scan needs to read the guest record.
- Finalise guest lists the day before, so edits and check-ins don't land in the same UTC day.
- For a really big event, Workers Paid is $5 for one month. Turn it on for that month, then turn it off.

## First-time setup

```bash
npm install -g wrangler
wrangler login
wrangler whoami
cd worker
wrangler deploy
```

If you ever recreate the KV namespace, run `wrangler kv namespace create TICKETS_KV` and paste the returned ID into `wrangler.toml`.

> [!warning] Secrets go in Worker secrets, nowhere else
> Put API tokens in with `wrangler secret put NAME`. The name goes in the command, and the value goes at the prompt. Never paste a token into a note, a commit, or a shell command.
