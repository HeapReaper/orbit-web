---
title: Added number guesser and purge
description: Again new features! Read to find out more!
date: 2026-05-1
author: HeapReaper
tags: discord, bot, features
---

## Number guesser
We've added a number guessing game.
You can create a new game with:
- /numberguesser start <min number> <max number>.

The bot will then pich a random number between <min number> and <max number>.
When a user sends a message in that channel with just a number, like 5,
then that will count as a guess and the bot reacts
if it's correct.

When someone posts a number below <min number> or above <max number>, the bot will react:
"Number to low/high".

You can stop the game with:
- /numberguesser stop

## Purge
We've added a new command named:
- /purge <number>

With this command you can purge a number of messages in the
channel where the command is ran.

