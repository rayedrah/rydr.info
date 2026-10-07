---
publish: true
title: "PING: Moving My Receipt Printer App to a Dedicated Ubuntu Server"
folder: Projects
order: 3
description: PING prints messages people send me on a thermal receipt printer. This is the step-by-step plan for moving it off my desktop onto a proper Ubuntu LTS server.
---

## What this is

PING is a small Flask web app. Anyone can send a message from a web page, and it prints on a Rongta USB thermal receipt printer in my dorm. It's public through a Cloudflare Tunnel at `ping.rydr.info`, with per-IP rate limiting so nobody can flood the printer.

It started on my Arch desktop. This guide moves it to a dedicated Ubuntu LTS server, and fixes the shortcuts I took the first time.

> [!important]
> The app has to run on whichever machine the printer is plugged into over USB, so the Ubuntu box needs to sit next to the printer.

## What you'll need

- An Ubuntu LTS machine with a free USB port
- The printer and its USB cable
- A Cloudflare account with your domain on Cloudflare DNS
- The project files from the old machine

## Step 1: Gather the project files

From the old machine, bring over:

- `rydr_app.py`
- `templates/rydr.html`
- `static/` (CSS, fonts, textures, icons)
- the `99-escpos.rules` udev rule
- the two systemd service files (`rydr-ping.service`, `rydr-tunnel.service`)

Leave two things behind on purpose:

- **`transaction_counter.txt`**. It gets replaced by SQLite in Step 5.
- **The Cloudflare tunnel credentials.** A fresh tunnel on the new machine is cleaner than copying certificates around.

The easiest way to move code is git, even if it's only local:

```bash
# on the old machine, inside the project folder
git init
git add .
git commit -m "Initial commit before migrating to Ubuntu server"
```

Push it to a private GitHub repo, and the migration becomes a single `git clone`.

## Step 2: Base setup on Ubuntu

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-venv python3-pip libusb-1.0-0 git curl
```

## Step 3: Use a virtual environment this time

On my desktop I installed packages with `--break-system-packages`. That works as a shortcut, but a server should keep the app's dependencies separate from the system Python:

```bash
git clone <your-repo-url> ~/ping
cd ~/ping
python3 -m venv venv
source venv/bin/activate
pip install flask flask-limiter python-escpos pyusb pillow gunicorn user-agents
```

No git? `scp -r` the folder over instead and create the venv inside it the same way.

## Step 4: Give the app printer access, scoped properly

The first time, I used a udev rule with `MODE="0666"`, which makes the printer readable and writable by every user on the machine. A server should limit that to one group.

Create the group and add yourself to it:

```bash
sudo groupadd escpos
sudo usermod -aG escpos $USER
```

Create the rule:

```bash
sudo nano /etc/udev/rules.d/99-escpos.rules
```

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fe6", ATTRS{idProduct}=="811e", MODE="0660", GROUP="escpos"
```

Reload the rules:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Log out and back in so the group applies, then unplug and replug the printer once.

> [!tip]
> `0fe6:811e` is my printer's vendor and product ID. Find yours with `lsusb`.

## Step 5: Replace the counter file with SQLite

Every receipt gets a transaction number. A plain text counter has a race: two people sending at the same moment can both read the same number before either writes it back. It also keeps no history.

SQLite fixes both with one file and no database server, and it gives you a log of every message ever sent:

```python
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ping.db')

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id INTEGER NOT NULL,
                sender_name TEXT,
                message TEXT NOT NULL,
                ip TEXT,
                browser TEXT,
                os TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

init_db()

def log_message(sender_name, message, ip, browser, platform):
    """Insert the row and get the new transaction id in one atomic step."""
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute(
            'INSERT INTO messages (transaction_id, sender_name, message, ip, browser, os) '
            'VALUES ((SELECT COALESCE(MAX(transaction_id), 0) + 1 FROM messages), ?, ?, ?, ?, ?)',
            (sender_name, message, ip, browser, platform)
        )
        conn.commit()
        return cur.lastrowid
```

In the `/send` route, replace the old counter call with `log_message(...)` and print using the number it returns. Check recent messages any time:

```bash
sqlite3 ping.db "SELECT transaction_id, sender_name, created_at FROM messages ORDER BY id DESC LIMIT 10;"
```

## Step 6: Create a fresh Cloudflare Tunnel

```bash
curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

cloudflared tunnel login
cloudflared tunnel create ping-rydr-prod
cloudflared tunnel route dns ping-rydr-prod ping.rydr.info
```

`route dns` overwrites the old DNS record, so there's nothing to clean up by hand. Once the new tunnel works, delete the old one under **Zero Trust → Networks → Tunnels**.

## Step 7: Run it as two systemd services

The app runs under gunicorn on localhost, and the tunnel exposes it.

`/etc/systemd/system/rydr-ping.service`:

```ini
[Unit]
Description=PING receipt printer web app
After=network.target

[Service]
Type=simple
User=your-username
Group=escpos
WorkingDirectory=/home/your-username/ping
Environment="PATH=/home/your-username/ping/venv/bin"
ExecStart=/home/your-username/ping/venv/bin/gunicorn -w 3 -b 127.0.0.1:5000 --access-logfile /home/your-username/ping/logs/access.log --error-logfile /home/your-username/ping/logs/error.log rydr_app:app
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/rydr-tunnel.service`:

```ini
[Unit]
Description=Cloudflare Tunnel for ping.rydr.info
After=network.target rydr-ping.service
Requires=rydr-ping.service

[Service]
Type=simple
User=your-username
ExecStart=/usr/local/bin/cloudflared tunnel run --url http://localhost:5000 ping-rydr-prod
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Three gunicorn workers follows the `(2 × CPU cores) + 1` rule for a 2-core machine, so adjust it for yours. Then enable both:

```bash
mkdir -p ~/ping/logs
sudo cp *.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now rydr-ping.service
sudo systemctl enable --now rydr-tunnel.service
```

## Step 8: Harden the server

**Settings in a `.env` file**, instead of editing the code every time:

```bash
pip install python-dotenv
```

```bash
# .env
RECIPIENT_NAME=rydr.
VENDOR_ID=0x0fe6
PRODUCT_ID=0x811e
```

```python
from dotenv import load_dotenv
load_dotenv()
RECIPIENT_NAME = os.environ.get("RECIPIENT_NAME", "rydr.")
```

**Log rotation**, so logs don't grow forever. Create `/etc/logrotate.d/ping`:

```
/home/your-username/ping/logs/*.log {
    weekly
    rotate 8
    compress
    missingok
    notifempty
}
```

**Firewall.** Cloudflare Tunnel only makes outbound connections, so the app needs no open inbound ports. Lock the rest down anyway:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw enable
```

**Automatic security updates**, since nobody is watching this box:

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

**SSH keys only.** In `/etc/ssh/sshd_config`, set `PasswordAuthentication no`, then `sudo systemctl restart ssh`.

**Nightly database backup** with `crontab -e`:

```
0 3 * * * sqlite3 /home/your-username/ping/ping.db ".backup /home/your-username/ping/backups/ping-$(date +\%F).db"
```

## Step 9: Cut over

1. Check that both services show **active** in `systemctl status`.
2. Move the printer's USB cable to the new machine.
3. Send a real message from your phone and watch it print.
4. Stop the old services on the desktop so nothing conflicts:

```bash
sudo systemctl disable --now rydr-ping.service rydr-tunnel.service
```

## Next

Once this is stable, running it in Docker with USB passthrough (`--device`) would turn the next migration into one `docker compose up`.
