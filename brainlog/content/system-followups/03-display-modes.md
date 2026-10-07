---
publish: true
title: "Arch + Hyprland, Part 3: Docked, Dual Monitor, and Laptop-Only Modes"
folder: System Followups
order: 3
date: 2026-05-09
description: Three display setups on a hybrid-GPU laptop, which four files change for each one, and how both GPUs share the work in dual-monitor mode.
---

## The idea

With hybrid graphics, each screen is wired to a different GPU:

```
NVIDIA (card0)  →  HDMI-A-1   external monitor
Intel  (card1)  →  eDP-1      laptop screen
```

That's why switching layouts means touching four files, not one.

## The four files

| What | File | Applies after |
| --- | --- | --- |
| Kernel display parameters | `/boot/loader/entries/arch.conf` | reboot |
| Monitor layout | `~/.config/hypr/hyprland.conf` | `hyprctl reload` |
| Output profile | `~/.config/shikane/config.toml` | restarting Hyprland |
| Which GPU Hyprland uses | `~/.config/hypr/env.conf` | restarting Hyprland |

## Mode 1: External monitor only (docked)

**arch.conf**

```
options root=/dev/nvme0n1p3 rw video=eDP-1:d video=eDP-2:d
```

**hyprland.conf**

```
monitor=eDP-1,disable
monitor=,preferred,auto,auto
```

**shikane**

```toml
[[profile]]
name = "docked"
[[profile.output]]
match = "HDMI-A-1"
enable = true
mode = "1920x1080"
position = "0,0"
[[profile.output]]
match = "eDP-1"
enable = false
```

**env.conf**: only the NVIDIA card.

```
env = AQ_DRM_DEVICES,/dev/dri/card0
```

> [!warning]
> If the external monitor is unplugged at boot in this mode, the screen stays blank. Switch to Mode 2 or 3 before unplugging.

## Mode 2: Both screens

**arch.conf**: remove every `video=` parameter so the kernel doesn't disable anything.

```
options root=/dev/nvme0n1p3 rw
```

**hyprland.conf**: the external monitor on the left, the laptop to its right at 1.25x scale.

```
monitor=HDMI-A-1,preferred,0x0,auto
monitor=eDP-1,preferred,1920x0,1.25
```

Adjust the scale to taste (1.0, 1.25, 1.5).

**shikane**

```toml
[[profile]]
name = "docked"
[[profile.output]]
match = "HDMI-A-1"
enable = true
mode = "1920x1080"
position = "0,0"
[[profile.output]]
match = "eDP-1"
enable = true
position = "1920,0"
```

**env.conf**: comment out `AQ_DRM_DEVICES`.

```
# env = AQ_DRM_DEVICES,/dev/dri/card0
```

With it unset, Hyprland finds both GPUs on its own: NVIDIA drives the external monitor and Intel drives the laptop screen. It also handles the card numbers swapping between boots.

**Workspaces 1-5 on the monitor, 6-10 on the laptop** (add to `hyprland.conf`):

```
workspace = 1, monitor:HDMI-A-1, default:true
workspace = 2, monitor:HDMI-A-1
workspace = 3, monitor:HDMI-A-1
workspace = 4, monitor:HDMI-A-1
workspace = 5, monitor:HDMI-A-1
workspace = 6, monitor:eDP-1
workspace = 7, monitor:eDP-1
workspace = 8, monitor:eDP-1
workspace = 9, monitor:eDP-1
workspace = 10, monitor:eDP-1
```

**Wallpaper on both screens:**

```
exec-once = awww img ~/Downloads/Wallpapers/wallhaven-xezolo.png --resize fit --outputs HDMI-A-1,eDP-1
```

## Mode 3: Laptop screen only

**arch.conf**

```
options root=/dev/nvme0n1p3 rw
```

**hyprland.conf**

```
monitor=eDP-1,preferred,0x0,1.25
monitor=HDMI-A-1,disable
```

**shikane**

```toml
[[profile]]
name = "laptop"
[[profile.output]]
match = "eDP-1"
enable = true
position = "0,0"
```

**env.conf**

```
# env = AQ_DRM_DEVICES,/dev/dri/card0
```

## Which connector belongs to which GPU

```
NVIDIA: card0-DP-3, card0-eDP-2, card0-HDMI-A-1
Intel:  card1-DP-1, card1-DP-2, card1-eDP-1   ← laptop screen
```

That's why Part 1 disables both `eDP-1` and `eDP-2`: each GPU exposes its own laptop panel connector.

## Quick checklist when switching

1. Edit `arch.conf` and reboot, if the kernel parameters changed.
2. Edit the `monitor=` lines in `hyprland.conf`.
3. Switch the shikane profile.
4. Set or comment out `AQ_DRM_DEVICES`.
5. `hyprctl reload`, or log out and back in.
