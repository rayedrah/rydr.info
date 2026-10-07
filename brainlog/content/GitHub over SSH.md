---
publish: true
category: Cyber
status: revised
audience: Anyone tired of typing GitHub passwords
title: GitHub over SSH
date: '2026-03-19'
tags:
- git
- cyber-tools
description: The git add variants I keep mixing up, and the compact SSH key setup
  that means never typing a password for GitHub again.
---
> git init 


#### Commands: 
- git add --all 
- git add -A 
> upper both are the same, adds all the changes

- git add . 
> add everything inside the CURRENT DIRECTORY 

- git add * 
>  adds files that are modified or added, IGNORES THE DELETED ONES. 

- git reset 
> resets the adds. 

# SSH Setup for GITHUB
## 🔐 GitHub SSH (Ultra-Compact)

### Setup

```bash
ssh-keygen -t ed25519 -C "email"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

→ Paste into GitHub (SSH keys)

---

### Test

```bash
ssh -T git@github.com
```

✔ Success = “Hi username!”

---

### Use SSH for Repo

```bash
git remote set-url origin git@github.com:<user>/<repo>.git
git push origin main
```

---

### Fixes

- ❌ Permission denied → `ssh-add ~/.ssh/id_ed25519`
    
- ❌ Password prompt → remote still HTTPS
    
- ❌ Wrong test → use `git@github.com` (NOT username)
    

---

### Rule

```text
SSH key + SSH remote = no password ever
```
