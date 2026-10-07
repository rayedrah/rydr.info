---
publish: true
category: Systems
status: logged
audience: Anyone starting an Obsidian vault
title: Day 1 with Obsidian
date: '2026-10-07'
tags:
- obsidian
- systems
description: 'Setting up my vault: a terminal theme, a pixel font, plugins, and a
  CSS snippet that finally fixed my folder icons.'
---
- Saw the [video](https://www.youtube.com/watch?v=z4AbijUCoKU)

- Changed the settings for Automatic linking of files in the vault if the names are changed. 

- Changed the setting for Default setting for Attachments and the Daily Notes.

- Tried out different themes and fonts 

- Changed the FONT of the UI and the text to BigBlueTerm 437 Mono. 

- Changed the Theme to TERMINAL2K 

- Changed the last part of the snippet so that the icons turn into the pngs made by CHATGPT 

- But nothing happened as Obsidan doesnt accept png in the icon space. 

- So downloaded the #PLUGIN named "ICONZIE" 

- Also downloaded the #PLUGIN named "Calendar"

- Added the webviewer in the Right Tab. 

<iframe width="657" height="370" src="https://www.youtube.com/embed/z4AbijUCoKU" title="Give Me 15 Minutes. I&#39;ll Teach You  80% of Obsidian" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

- Fixed the Snippet code in the LAST !!  
```
/* Remove ONLY emoji-based folder icons — keep the collapse/expand arrow */
.nav-folder-title-content::before,
.nav-folder-children .nav-folder-title-content::before {
    content: "" !important;
    background: none !important;
    background-image: none !important;
    mask: none !important;
    -webkit-mask: none !important;
    color: transparent !important;
}

/* Make sure the collapse arrow ( > ) stays */
.tree-item-icon.collapse-icon {
    opacity: 1 !important;
    display: inline-block !important;
}

```