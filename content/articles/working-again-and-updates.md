working-again-and-updates.md---
---
title: Working again and new updates!
description: We hath some downtime and made some updates
date: 2026-8-7
author: HeapReaper
tags: discord, bot, downtime, updates
---

## Downtime
We hath some downtime from wensday 5-8-2026 to 6-8-2026.
This was because Clickhouse wrote 24GB for logs to the discs, which caused the
database crash because there was no room left to write to disk.

## Logs
I've added "Deleted by" for deleted messages log and I added "Kicked by": For when someone
kicks someone else from a voice channel.

## Databases change
Because my issues with ClickhHouse, I've switched to InfluxDB as the analytics
database.
