---
publish: true
title: "Arch + Hyprland, Part 1: First Setup on a Laptop with an External Monitor"
folder: System Followups
order: 1
description: Getting the login screen onto my external monitor instead of the closed laptop panel, plus the clipboard, screenshot, lock, idle, wallpaper, and greeter setup I started with.
---

## The machine

An ASUS laptop with hybrid graphics (Intel Iris Xe + NVIDIA RTX 3050 Mobile), running Arch Linux with the Hyprland window manager. Most of the time the lid is closed and I use a $50 Dell monitor over HDMI.

This entry covers the first working setup. The later entries in this folder follow what changed after things broke.

## Problem: the login screen shows up on the closed laptop

My login screen kept appearing on the **laptop panel** instead of the external monitor. Inside Hyprland I had already disabled the laptop screen:

```
monitor=eDP-1,disable
monitor=,preferred,auto,auto
```

But that only applies **after** login. The boot order is the problem:

```
kernel starts the laptop panel (eDP) first
  → the login greeter attaches to the first display
  → login shows on the laptop
  → Hyprland disables the laptop screen, but only after you log in
```

So the fix has to happen at the **kernel** level, before anything else draws.

## Fix: disable the laptop panel at boot (systemd-boot)

Edit the boot entry:

```bash
sudo nano /boot/loader/entries/arch.conf
```

Change the `options` line from:

```
options root=/dev/nvme0n1p3 rw
```

to:

```
options root=/dev/nvme0n1p3 rw video=eDP-1:d video=eDP-2:d
```

`video=eDP-*:d` tells the kernel to disable the internal display (`d` = disabled). Reboot, and the whole chain (boot, greeter, Hyprland) appears on the HDMI monitor while the laptop screen stays off.

> [!warning] Don't boot without the monitor plugged in
> With these parameters set, booting without the external monitor gives a completely blank screen.

### Undo: get the laptop screen back

Edit the same file and remove the `video=` parameters:

```
options root=/dev/nvme0n1p3 rw
```

Reboot, and the laptop screen works normally.

| Mode | Kernel parameters |
| --- | --- |
| Desktop (external only) | `video=eDP-1:d video=eDP-2:d` |
| Laptop | none |

## Clipboard history (cliphist + wofi)

I wanted clipboard history with a popup picker, while still pasting by hand, because auto-paste tools like `wtype` are unreliable in terminals and different apps use different paste shortcuts.

Start the clipboard watchers in `hyprland.conf`:

```ini
exec-once = wl-paste --type text --watch cliphist store
exec-once = wl-paste --type image --watch cliphist store
```

Bind the picker:

```ini
bind = $mainMod, V, exec, cliphist list | wofi --dmenu | cliphist decode | wl-copy
```

How it works:

```
copy something → SUPER+V → pick an item → paste it yourself
```

| Where | Paste with |
| --- | --- |
| Terminal | Ctrl + Shift + V |
| Other apps | Ctrl + V |

The picker only puts the item back on the clipboard. You still paste it, and that's what makes it work the same everywhere.

## Screenshots (hyprshot)

| Keys | What it does |
| --- | --- |
| SUPER + X | Region screenshot, copy only |
| SUPER + Shift + X | Region screenshot, saved to Pictures |
| Fn + PrtSc | Whole screen, saved |

`hyprshot -m window` lets you click a window to capture it.

## Notifications, lock, and idle

- **Notifications:** swaync, started with `exec-once = swaync`.
- **Lock screen:** hyprlock, bound to SUPER + L.
- **Idle:** hypridle locks the screen after 300 seconds, configured in `~/.config/hypr/hypridle.conf`.

## Wallpaper (awww)

```bash
sudo pacman -S awww
```

In `hyprland.conf`:

```ini
exec-once = awww-daemon
exec-once = awww img /path/to/wallpaper.jpg --resize fit
```

| Flag | Effect |
| --- | --- |
| `--resize fit` | whole image, may add bars |
| `--resize crop` | fills the screen, crops edges |
| `--resize no` | original size, centered |

There's no config file; everything is a command. For a transition: `awww img wall.jpg --transition-type wave --transition-duration 2`.

> [!note]
> Starting `awww img` at the same moment as `awww-daemon` can fail, because the daemon isn't ready yet. Part 4 fixes this.

## Login greeter (sysc-greet)

```bash
yay -S sysc-greet-hyprland
```

`/etc/greetd/config.toml`:

```toml
[terminal]
vt = 1

[default_session]
command = "start-hyprland -- -c /etc/greetd/hyprland-greeter-config.conf"
user = "greeter"
```

The ASCII art lives in `/usr/share/sysc-greet/ascii_configs/hyprland.conf`. Change `name=` for the display name, add `ascii_1=` through `ascii_N=` for variants, and set `colors=` for color cycling.

On the login screen, **F1** opens themes and background effects, **F2** picks the session, **F4** is the power menu, and **Page Up/Down** cycles the ASCII variants.

I later dropped the greeter entirely. Part 2 explains why.
