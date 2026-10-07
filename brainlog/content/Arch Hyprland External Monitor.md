---
publish: true
category: Systems
status: revised
audience: Linux tinkerers running Hyprland on a laptop
title: 'Arch + Hyprland: Booting Straight to My External Monitor'
date: '2026-10-07'
tags:
- arch
- hyprland
- linux
description: My login screen kept showing up on the closed laptop panel. The fix lives
  at the kernel level, plus my clipboard history setup.
---
> HYPRLAND 

> If Crashes: 
> 	sudo pacman -S xdg-desktop-potal-hyprland mesa 

Super + E (dolphin file manager)
Super + F (Window size change)
# Base Conf. 

### Monitor Dell $50 | Asus Lid off

> Hyprland.conf 

monitor=eDP-1,disable
monitor=,preffered,auto,auto

> SDDM login page transfer to the Monitor 

wallpaper: 
https://www.youtube.com/watch?v=Bwp2xWis8qk


### Display Kernel Cancel. 

## Problem

Login (`sysc`) appeared on the **laptop screen** instead of the external monitor.

Reason:

Kernel initializes laptop panel (eDP) first  
→ greetd attaches to first display  
→ sysc shows on laptop  
→ Hyprland disables it only AFTER login

So the fix must happen **at kernel boot level**, not in Hyprland.

---

## Fix (systemd-boot)

Edit boot entry:

sudo nano /boot/loader/entries/arch.conf

Original:

options root=/dev/nvme0n1p3 rw

Change to:

options root=/dev/nvme0n1p3 rw video=eDP-1:d video=eDP-2:d

Explanation:

video=eDP-*:d  
d = disable internal laptop display

Reboot:

reboot

Result:

Boot  
→ greetd  
→ sysc 
→ Hyprland  
  
All appear on HDMI monitor.  
Laptop screen stays OFF.

---

## Undo (restore laptop screen)

Edit again:

sudo nano /boot/loader/entries/arch.conf

Remove the parameters:

options root=/dev/nvme0n1p3 rw

Reboot.

Laptop screen works normally again.

---

## System Setup

Bootloader: systemd-boot  
Login manager: greetd  
Greeter: sysc  
WM: Hyprland  
Monitor: HDMI-A-1  
Laptop panel: eDP

---

✅ Toggle summary:

Desktop mode:  
video=eDP-1:d video=eDP-2:d  
  
Laptop mode:  
(no video parameters)



# Clipboard
## 🧠 Clipboard Setup (Hyprland + cliphist)

### 🎯 Goal

Use clipboard history (`cliphist`) with a popup selector, while keeping **manual paste behavior** for reliability (especially in terminal).

---

### ⚙️ Keybind

```ini
bind = $mainMod, V, exec, cliphist list | wofi --dmenu | cliphist decode | wl-copy
```

---

### 🔁 Workflow

```text
Copy (Ctrl+C / Ctrl+Shift+C)
→ SUPER + V
→ Select item (Enter)
→ Paste manually
```

---

### ⌨️ Paste Behavior

|Context|Paste Shortcut|
|---|---|
|Terminal|Ctrl + Shift + V|
|Normal Apps|Ctrl + V|

---

### ⚠️ Important Notes

- This setup **does NOT auto-paste**
    
- It only restores the selected item into clipboard
    
- Manual paste is required → **more stable across apps**
    

---

### 🧠 Why this setup?

- `wtype` auto-paste is unreliable in terminals
    
- Different apps use different paste shortcuts
    
- This approach is **universal + predictable**
    

---

### 🔧 Clipboard Watchers (required)

```ini
exec-once = wl-paste --type text --watch cliphist store
exec-once = wl-paste --type image --watch cliphist store
```

---

### 🧪 Mental Model

```text
cliphist list → wofi → select → wl-copy → (YOU paste)
```

---

### 🚀 TL;DR

```text
SUPER+V = choose clipboard item
Ctrl+Shift+V = paste in terminal
Ctrl+V = paste in apps
```

### CLEARING THE CLIPBOARD 
- SUPER + Space 
- Search Clipboard manager
- Hit enter
- Clear the clipboard from their. 


# Screenshot

> Hyprshot 

- hyprshot -m window (lets you select windows)
	- screenshots are saved in the default picture folder. 

> fn + prtsc (prints the whole screen and saves it)

> SUPER + X (region screenshot and copy only)
> SUPER SHIFT + X (region screenshot and save in Pictures)

# Notification 

> swaync 

changed the config 
> exec-once = swaync 

# Lock-screen  

hyprlock

> SUPER  + l 


# Idle 

Hypridle 

> 300 secs 

and ~/.config/hypr/hypridle.conf 

# Wallpaper
## swww Setup

## Install
`sudo pacman -S awww`

## Hyprland Config
add to `~/.config/hypr/hyprland.conf`:
\`\`\`
exec-once = awww-daemon
exec-once = awww img /path/to/wallpaper.jpg --resize fit
\`\`\`

## Usage
\`\`\`bash
awww img /path/to/wallpaper.jpg              # basic
awww img /path/to/wallpaper.jpg --resize fit # no crop
awww img /path/to/wallpaper.jpg --transition-type wave --transition-duration 2
\`\`\`

## Resize Modes
| Flag            | Effect                    |
| --------------- | ------------------------- |
| `--resize fit`  | whole image, may add bars |
| `--resize crop` | fills screen, crops edges |
| `--resize no`   | original size, centered   |

## No config file — CLI only
---

# Login Greeter
## sysc-greet Setup

## Install
`yay -S sysc-greet-hyprland`

## greetd Config
`/etc/greetd/config.toml`
[terminal]
vt = 1
[default_session]
command = "start-hyprland -- -c /etc/greetd/hyprland-greeter-config.conf"
user = "greeter"

## ASCII Art
Location: `/usr/share/sysc-greet/ascii_configs/hyprland.conf`
- Edit `name=` to change display name
- Add `ascii_1=` through `ascii_N=` for variants
- `colors=` for hex color cycling
- `roasts=` for roast messages separated by `│`

## Key Bindings (on login screen)
| Key | Action |
|-----|--------|
| Page Up/Down | Cycle ASCII variants |
| F1 | Settings (themes, borders, backgrounds) |
| F2 | Session selection |
| F4 | Power menu |
| Tab | Navigate fields |
| Enter | Submit |

## Themes
Dracula, Gruvbox, Nord, Tokyo Night, Catppuccin, Monochrome, and more.
Change via F1 on login screen.

## Background Effects
Fire (DOOM), Matrix rain, ASCII rain, Fireworks, Aquarium
Change via F1 on login screen.