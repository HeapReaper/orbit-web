---
title: April 2026 updates
description: We've worked hard to improve Orbit. Read more here!
date: 2026-04-29
author: HeapReaper
tags: discord, bot, updates
---

## New module
We've added Chess.com integration!
With this integration, you can display your own or somebody else statistics.
The following commands are used for this:
- /chess link <your chess.com username>
- /chess unlink
- /chess stats

## Improved AntiBot
We've added a option named "Block NSFW Discord invites".
this blocks Discord invites which are deemed 18+. It checks for this with 2 methods:
- Which age level has been setup
- If there are keywords like "Nude", "18+" in the server title or description

## Leveling
There is a new command: /leveling level.
This shows your current level and how mutch XP is needed for your next level.

## Logging
We've pushed a bugfix which solved that the logged timeout time is 5690 years
instead of the actual timeout time

## API
There are two new API endpoints:
- /api/serverstats - Returns server statistics like member count, boost count
- /api/get-images-api - Return images from a channel

## Reporting
We've added three new reporting commands so users can report bugs easily:
- /orbit bug
- /orbit feature
- /orbit abuse


