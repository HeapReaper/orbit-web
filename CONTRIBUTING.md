# Contributing

### Installation


### File Tree
```
|   .editorconfig
|   .env.example # Example environment file
|   .gitignore  
|   biome.json
|   Dockerfile # The Dockerfile for hosting on Coolify
|   instrumentation-client.ts
|   instrumentation.ts
|   next-sitemap.config.js
|   next.config.ts # The NextJS config
|   package-lock.json
|   package.json
|   postcss.config.mjs
|   README.md
|   CONTRIBUTING.MD
|   sentry.edge.config.ts
|   sentry.server.config.ts
|   tsconfig.json
|
+---.idea # Editor files (WebStorm)
|   |   .gitignore
|   |   dataSources.xml
|   |   data_source_mapping.xml
|   |   modules.xml
|   |   Orbit.iml
|   |   vcs.xml
|   |   workspace.xml
|   |
|   \---inspectionProfiles
|           Project_Default.xml
|
+---app # Global CSS and layout
|   |   global-error.tsx
|   |   globals.css
|   |   layout.tsx
|   |
|   +---(dashboard) # The dashboard begint authentication
|   |   \---dashboard
|   |       |   global.css
|   |       |   layout.tsx
|   |       |   page.tsx
|   |       |
|   |       +---bot
|   |       |       page.tsx
|   |       |
|   |       +---components
|   |       |   |   Header.tsx
|   |       |   |   MarkdownEditor.tsx
|   |       |   |   PageLoader.tsx
|   |       |   |   Sidebar.tsx
|   |       |   |
|   |       |   +---buttons
|   |       |   |       AddBot.tsx
|   |       |   |       Delete.tsx
|   |       |   |       JoinOurDiscord.tsx
|   |       |   |       Save.tsx
|   |       |   |       Settings.tsx
|   |       |   |
|   |       |   +---cards
|   |       |   |       ModuleCard.tsx
|   |       |   |
|   |       |   +---charts
|   |       |   |       ActiveVsInactiveMembers.tsx
|   |       |   |       CommandUsageChart.tsx
|   |       |   |       JoinsOverTime.tsx
|   |       |   |       MessageFlowOverTime.tsx
|   |       |   |       MostActiveChannels.tsx
|   |       |   |       MostActiveUsers.tsx
|   |       |   |       TotalMessagesOverTime.tsx
|   |       |   |
|   |       |   +---inputs
|   |       |   |       ChannelSelect.tsx
|   |       |   |       IconButton.tsx
|   |       |   |       Number.tsx
|   |       |   |       Select.tsx
|   |       |   |       Switch.tsx
|   |       |   |       Text.tsx
|   |       |   |
|   |       |   +---labels
|   |       |   |       Free.tsx
|   |       |   |       Premium.tsx
|   |       |   |
|   |       |   +---previews
|   |       |   |       Embed.tsx
|   |       |   |       Message.tsx
|   |       |   |
|   |       |   +---sections
|   |       |   |       BotInfo.tsx
|   |       |   |       BotSettings.tsx
|   |       |   |       Help.tsx
|   |       |   |       ModuleSection.tsx
|   |       |   |       ServerInfo.tsx
|   |       |   |       UserInfo.tsx
|   |       |   |
|   |       |   \---ui
|   |       |           InfoToolTip.tsx
|   |       |           InlineCode.tsx
|   |       |
|   |       +---data
|   |       |       analytics.ts
|   |       |       guilds.ts
|   |       |       helpData.ts
|   |       |       modules.ts
|   |       |
|   |       +---logs
|   |       |       page.tsx
|   |       |
|   |       +---modules
|   |       |   +---analytics
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---anti-bot
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---auto-message
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---auto-role
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---birthday
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---bump-reminder
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---channel-of-fame
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---commands
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---giveaway
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---introduction
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---invite-tracker
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---kick-watcher
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---leave-message
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---leveling
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---logging
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---minecraft
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---picture-contest
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---tickets
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---twitch-watcher
|   |       |   |       page.tsx
|   |       |   |
|   |       |   +---welcome-message
|   |       |   |       page.tsx
|   |       |   |
|   |       |   \---youtube-watcher
|   |       |           page.tsx
|   |       |
|   |       +---owner
|   |       |       page.tsx
|   |       |
|   |       \---support
|   |               page.tsx
|   |
|   +---(public) # Layout and page for the homepage
|   |   |   layout.tsx
|   |   |   not-found.tsx
|   |   |   page.tsx
|   |   |
|   |   +---components
|   |   |       Nav.tsx
|   |   |
|   |   +---data
|   |   |       reviews.ts
|   |   |
|   |   +---help
|   |   |   +---bot-settings
|   |   |   |       page.tsx
|   |   |   |
|   |   |   +---commands-list
|   |   |   |       page.tsx
|   |   |   |
|   |   |   +---get-started
|   |   |   |       page.tsx
|   |   |   |
|   |   |   +---premium-features
|   |   |   |       page.tsx
|   |   |   |
|   |   |   +---support
|   |   |   |       page.tsx
|   |   |   |
|   |   |   \---troubleshooting
|   |   |           page.tsx
|   |   |
|   |   +---privacy
|   |   |       page.tsx
|   |   |
|   |   +---releases
|   |   |       page.tsx
|   |   |
|   |   +---subscriptions
|   |   |       page.tsx
|   |   |
|   |   \---terms
|   |           page.tsx
|   |
|   +---api
|   |   +---add-dashboard-action-log
|   |   |       route.ts
|   |   |
|   |   +---anti-bot
|   |   |       route.ts
|   |   |
|   |   +---auth
|   |   |   \---[...nextauth]
|   |   |           options.ts
|   |   |           route.ts
|   |   |
|   |   +---auto-message
|   |   |       route.ts
|   |   |
|   |   +---auto-role
|   |   |       route.ts
|   |   |
|   |   +---birthday
|   |   |       route.ts
|   |   |
|   |   +---bot-settings
|   |   |       route.ts
|   |   |
|   |   +---bumpreminders
|   |   |       route.ts
|   |   |
|   |   +---channel-of-fame
|   |   |       route.ts
|   |   |
|   |   +---discord
|   |   |   +---channels
|   |   |   |       route.ts
|   |   |   |
|   |   |   \---guilds
|   |   |           route.ts
|   |   |
|   |   +---fetch-analytics
|   |   |       route.ts
|   |   |
|   |   +---giveaway
|   |   |       route.ts
|   |   |
|   |   +---introduction
|   |   |       route.ts
|   |   |
|   |   +---invite-tracker
|   |   |       route.ts
|   |   |
|   |   +---kick-watcher
|   |   |       route.ts
|   |   |
|   |   +---leave-message
|   |   |       route.ts
|   |   |
|   |   +---leveling
|   |   |       route.ts
|   |   |
|   |   +---logging
|   |   |       route.ts
|   |   |
|   |   +---logs
|   |   |       route.ts
|   |   |
|   |   +---minecraft
|   |   |       route.ts
|   |   |
|   |   +---minecraft-status
|   |   |       route.ts
|   |   |
|   |   +---owner
|   |   |       route.tsx
|   |   |
|   |   +---picture-contest
|   |   |       route.ts
|   |   |
|   |   +---premium
|   |   |       route.ts
|   |   |
|   |   +---refresh-commands
|   |   |       route.ts
|   |   |
|   |   +---sentry-example-api
|   |   |       route.ts
|   |   |
|   |   +---stats
|   |   |       route.ts
|   |   |
|   |   +---tickets-settings
|   |   |       route.ts
|   |   |
|   |   +---twitch-watcher
|   |   |       route.ts
|   |   |
|   |   +---user-action
|   |   |       route.ts
|   |   |
|   |   +---welcome-message
|   |   |       route.ts
|   |   |
|   |   \---youtube-watcher
|   |           route.ts
|   |
|   +---context
|   |       GuildContext.tsx
|   |       NotificationContext.tsx
|   |
|   +---lib
|   |       addDashboardLog.ts
|   |       cleanMessage.ts
|   |       clickhouse.ts
|   |       isGuildAdmin.ts
|   |       isPremiumGuild.ts
|   |       prisma.ts
|   |       rateLimit.ts
|   |       rateLimitApi.ts
|   |       redis.ts
|   |       useHandleZodErrors.ts
|   |       validateApiSessionAndGuildAdmin.ts
|   |
|   +---login
|   |       page.tsx
|   |
|   +---providers
|   |       SessionProvider.tsx
|   |
|   +---sentry-example-page
|   |       page.tsx
|   |
|   +---types # Our types, each has it's own file
|   |       modules.ts
|   |       nav.ts
|   |       next-auth.d.ts
|   |       reviews.ts
|   |
|   \---zod # Input validation
|           birthdaySettings.ts
|           botSettings.ts
|           pictureContest.ts
|
+---prisma
|       schema.prisma
|
\---public
    |   banner-empty.png
    |   banner-v2.png
    |   banner.png
    |   favicon.ico
    |   file.svg
    |   globe.svg
    |   logo-medium-.png
    |   logo-medium-2.png
    |   logo-medium-3.png
    |   logo-small.png
    |   logo.png
    |   next.svg
    |   robots.txt
    |   sitemap.xml
    |   vercel.svg
    |   window.svg
    |
    +---icons
    |       arrow-right.png
    |
    +---reviews
    |       theghostofchaos.jpg
    |
    \---screenshots
            analytics.png
            auto_message.png
            auto_message_2.png
            auto_message_3.png
            birthday.png
            bot_settings.png
            bump_reminder.png
            dashboard.png
            logs.png

```