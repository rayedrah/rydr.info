---
publish: true
title: "Arch + Hyprland, Part 4: Moving to Lua Config, and a BSOD Lock Screen"
folder: System Followups
order: 4
scan_allow: ["\"Username:\" / \"Password:\""]
date: 2026-10-04
description: An update broke my wallpaper and deprecated my config, so I moved Hyprland to its new Lua config, fixed a startup race, and rebuilt the lock screen.
---

## What broke

After a system update (Hyprland 0.54 → 0.56), I rebooted to Hyprland's default background and a deprecation message. Two separate causes:

1. **Hyprland 0.56 deprecates `hyprland.conf`** (the old "hyprlang" format), and 0.57 removes it entirely. The future is a Lua config.
2. **A startup race:** `awww img` ran at the same moment as `awww-daemon` and failed because the daemon wasn't ready yet.

## Step 1: Split the config into Lua modules

Hyprland loads `hyprland.lua` if it exists and falls back to `hyprland.conf` if not. I moved to this layout:

```
~/.config/hypr/
├── hyprland.lua          ← entry point, loads the modules
├── modules/
│   ├── keybinds.lua      ← loaded first, outside pcall
│   ├── env.lua           ← environment variables
│   ├── monitors.lua      ← monitors + workspace rules
│   ├── input.lua         ← keyboard, touchpad, gestures
│   ├── looknfeel.lua     ← gaps, borders, blur, animations
│   ├── rules.lua         ← window rules
│   └── autostart.lua     ← things to run on startup
├── hyprland.conf.bak     ← old config, rollback only
└── hyprlock.conf / hypridle.conf  ← still hyprlang, unaffected
```

> [!tip] Load keybinds first, outside `pcall`
> The other modules load inside `pcall`, so an error in one doesn't take everything down. Keybinds load first and outside it, so even if another module is broken, the keyboard still works and you can fix things.

`modules/env.lua`:

```lua
hl.env("XCURSOR_SIZE", "24")
hl.env("HYPRCURSOR_SIZE", "24")
hl.env("LIBVA_DRIVER_NAME", "nvidia")
hl.env("__GLX_VENDOR_LIBRARY_NAME", "nvidia")
hl.env("NVD_BACKEND", "direct")
hl.env("GBM_BACKEND", "nvidia-drm")
-- hl.env("AQ_DRM_DEVICES", "/dev/dri/card0")
-- Uncomment AQ_DRM_DEVICES (card0 only) for docked mode
```

The choice between `.lua` and `.conf` happens once at startup, so switching needs a log out and back in, not a reload.

Confirm which config actually loaded:

```bash
grep -i "config" "$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/hyprland.log" | head
```

Look for `configProvider: lua`. Then check for errors (empty output means clean):

```bash
hyprctl configerrors
```

## Step 2: Fix the wallpaper race

Instead of starting the daemon and setting the wallpaper at the same time, wait until the daemon answers:

```lua
hl.on("hyprland.start", function()
    hl.exec_cmd("waybar")
    hl.exec_cmd("shikane")
    hl.exec_cmd("swaync")
    hl.exec_cmd("hypridle")
    hl.exec_cmd("wl-paste --type text --watch cliphist store")
    hl.exec_cmd("wl-paste --type image --watch cliphist store")
    hl.exec_cmd("awww-daemon")
    -- wait up to ~5s for awww-daemon, then set the wallpaper
    hl.exec_cmd("sh -c 'for i in $(seq 50); do awww query >/dev/null 2>&1 && break; sleep 0.1; done; awww img ...'")
end)
```

The loop checks `awww query` every 0.1 seconds, up to 50 times, and sets the wallpaper as soon as the daemon is up.

## Step 3: The lock screen

I rebuilt hyprlock around a 3840x2160 wallpaper of a cyborg skull whose goggles show a cracked Windows blue screen. The login form sits inside the goggles, styled like a BSOD, while the art's own BSOD text stays visible on the left.

The background settings that keep the art sharp:

```
blur_passes = 0
brightness = 1.0
color = rgb(0, 0, 0)    # fallback: a wrong image path shows black instead of failing
```

Every widget has `monitor =` left blank, so both screens get the same layout.

| Element | Position | Color |
| --- | --- | --- |
| Visor panel (1000x260 shape) | `0, 40` | invisible `rgba(4, 4, 220, 0.0)` |
| Date | `200, 145` | white |
| Login box (560x120, 2px border) | `200, 40` | transparent fill, white border |
| "welcome back" bar | `70, 96` | white |
| "welcome back rydr.!" text | `70, 101` | BSOD blue `rgb(4, 4, 220)` |
| "Username:" / "Password:" | `10, 61` / `10, 31` | white |
| `$USER` | `140, 61` | yellow `rgb(255, 214, 0)` |
| Password field (200x50) | `150, 31` | pink dots `rgb(255, 46, 151)` |

- The font is **Press Start 2P** everywhere.
- The BSOD blue was sampled straight from the pixels of the image.
- Everything is shifted 200px right of center to land inside the goggles.
- hyprlock reads its config fresh on every lock, so changes show up immediately.

### Tuning it to your own image

- **Panel transparency:** the 4th value of the visor panel's `color` (0.0 is invisible, 1.0 is solid).
- **Move everything up or down:** change the second `position` number on every widget by the same amount.
- **Move everything left or right:** change the first `position` number on every widget by the same amount.
- **Lock shows black:** the image path is wrong. Check it with `ls`.
- **No login widgets:** run `hyprlock` from a terminal and read the parse errors.

> [!note]
> The positions are tuned for the 1920x1080 external monitor. The laptop screen runs at 1.25x scale, so alignment with the goggles is slightly off there.

## When the new config breaks

**Hyprland won't start**

1. Make sure you're on a physical TTY.
2. `lsmod | grep nvidia` to check the modules.
3. `ls /dev/nvidia*` to check that `/dev/nvidia0` exists. If it's missing, reboot. Don't try a manual `modprobe`.

**The Lua config is broken**

- `hyprctl configerrors` shows what's wrong.
- A broken module shows a critical notification, but keybinds still work.
- To roll back from a TTY: `mv ~/.config/hypr/hyprland.lua ~/.config/hypr/hyprland.lua.off`, then log in again. This only works on 0.56 or older, since 0.57 removes the old format.

**Wallpaper missing**

- `pgrep -a awww` to check that the daemon is running.
- Set it manually: `awww img ~/Downloads/Wallpapers/wallhaven-xezolo.png --resize fit --outputs HDMI-A-1,eDP-1`
- An "awww-daemon instance already running" panic is harmless. It just means the daemon is already up.

**GBM device error / no allocator**

Usually `nvidia_drm` loaded but `/dev/nvidia0` wasn't created. Reboot cleanly.

## Still on my list

My dotfiles repo lives at `~/.config/hypr/dotfiles/`, so GNU Stow links things relative to the wrong folder, and the live config has drifted from the repo. The fix is to copy the live `hyprland.lua` and `modules/` into the repo, move it to `~/dotfiles`, remove the stray symlink, and run `stow -t ~` on each package.
