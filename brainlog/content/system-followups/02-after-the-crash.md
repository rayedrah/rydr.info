---
publish: true
title: "Arch + Hyprland, Part 2: Rebuilding a Stable NVIDIA Setup After a Crash"
folder: System Followups
order: 2
scan_allow: ["getty@tty1.service"]
date: 2026-04-22
description: After a crash I rebuilt the setup around the NVIDIA open driver, dropped the display manager, fixed a garbled TTY, and wrote down how to recover when it breaks.
---

## The hardware

| Part | Details |
| --- | --- |
| Machine | ASUS laptop, hybrid graphics |
| CPU | Intel Alder Lake-P |
| GPU 1 | NVIDIA RTX 3050 Mobile (GA107M), PCI `0000:01:00.0` |
| GPU 2 | Intel Iris Xe |
| RAM | 30 GB |
| Disk | 476.9 GB Samsung NVMe |

Partitions:

```
nvme0n1p1 → /boot  (512 MB)
nvme0n1p2 → swap   (8 GB)
nvme0n1p3 → /      (468 GB)
```

## Step 1: The NVIDIA driver

I use the open kernel module:

| Package | Version |
| --- | --- |
| nvidia-open | 595.58.03 |
| nvidia-utils | 595.58.03 |
| linux-firmware-nvidia | 20260309 |
| egl-wayland | 1.1.21 |

What surprised me is how little config it needs:

- `nvidia-drm.modeset=Y` is turned on automatically. No kernel parameter needed.
- The nouveau and nova drivers are blacklisted automatically by `/usr/lib/modprobe.d/nvidia-utils.conf`.
- No `/etc/modprobe.d/nvidia.conf` is needed.
- In `/etc/mkinitcpio.conf`, `MODULES=()` stays empty, because the `autodetect` hook loads NVIDIA.

```
HOOKS=(base systemd autodetect microcode modconf kms keyboard keymap sd-vconsole block filesystems fsck)
```

Check that it loaded:

```bash
lsmod | grep nvidia
```

You should see `nvidia_drm`, `nvidia_modeset`, `nvidia_uvm`, and `nvidia`.

## Step 2: Tell Hyprland to use the NVIDIA GPU

In `~/.config/hypr/env.conf`:

```
env = LIBVA_DRIVER_NAME,nvidia
env = __GLX_VENDOR_LIBRARY_NAME,nvidia
env = NVD_BACKEND,direct
env = GBM_BACKEND,nvidia-drm
env = AQ_DRM_DEVICES,/dev/dri/card0
```

> [!warning] Card numbers can swap between boots
> `card0` is usually NVIDIA and `card1` is usually Intel, but not always. Check which is which:
> ```bash
> cat /sys/class/drm/card0/device/vendor   # 0x10de = NVIDIA
> cat /sys/class/drm/card1/device/vendor   # 0x8086 = Intel
> ```
> The stable PCI path (`/dev/dri/by-path/pci-0000:01:00.0-card`) looks like the obvious fix, but it **doesn't work** in `AQ_DRM_DEVICES`: Hyprland's backend splits that variable on colons, and the PCI path is full of them. Use the card number, or leave the variable unset and let it auto-detect.

## Step 3: No display manager, boot straight to a TTY

I disabled both greetd and sddm. The laptop boots to a text login on TTY1, and I run `start-hyprland` after logging in. One less thing to break.

| Service | State |
| --- | --- |
| greetd | disabled |
| sddm | disabled |
| getty@tty1 | enabled |
| chvt1 (below) | enabled |

> [!note]
> Hyprland has to start from a physical TTY. It can't be launched over SSH, because an SSH session has no seat.

## Step 4: Fix the garbled TTY on boot

My TTY1 login banner came up garbled, because the display wasn't fully initialized yet when it was drawn. The fix is a tiny service that waits three seconds, then switches to TTY1, which forces a redraw.

`/etc/systemd/system/chvt1.service`:

```ini
[Unit]
Description=Switch to TTY1 on boot after delay
After=getty@tty1.service

[Service]
Type=oneshot
ExecStart=/bin/sleep 3
ExecStart=/usr/bin/chvt 1

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable chvt1.service
```

## Step 5: The desktop itself

Keybinds use **Ctrl + Alt** as the main modifier:

| Keys | Action |
| --- | --- |
| Ctrl+Alt+Q | Terminal (kitty) |
| Ctrl+Alt+C | Close window |
| Ctrl+Alt+E | Files (nautilus) |
| Ctrl+Alt+F | Toggle floating |
| Ctrl+Alt+Space | App launcher (wofi) |
| Ctrl+Alt+L | Lock (hyprlock) |
| Ctrl+Alt+V | Clipboard history |
| Ctrl+Alt+X / +Shift | Region screenshot (copy / save) |
| Ctrl+Alt+1-0 | Switch workspace |
| Ctrl+Alt+S | Scratchpad |

Apps: kitty, nautilus, wofi, waybar, swaync, hypridle, hyprlock, hyprshot, cliphist, awww for wallpaper, and shikane for monitor layouts.

Shell: zsh with Oh My Zsh and the Powerlevel10k theme.

## When it breaks: my recovery checklist

**Hyprland won't start**

1. Make sure you're on a physical TTY, not SSH.
2. `lsmod | grep nvidia` to confirm the driver loaded.
3. Confirm `AQ_DRM_DEVICES` points at the NVIDIA card (see Step 2).
4. Read the log: `cat /run/user/1000/hypr/*/hyprland.log | grep -i err`

**Blank screen at boot**

The external monitor is unplugged, but the `video=eDP` parameters from Part 1 are still set. Remove them from `/boot/loader/entries/arch.conf`.

**/boot is filling up**

A 512 MB `/boot` fills after a few kernel updates. Clear old packages from the cache:

```bash
sudo paccache -rk1
```

**A known harmless crash**

`libaquamarine` can segfault when a display connector disconnects on greeter exit (upstream issue `hyprwm/aquamarine#219`). With no greeter, it doesn't apply.
