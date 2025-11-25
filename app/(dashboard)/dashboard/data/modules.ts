import { moduleType } from "@/app/types/modules";

const modules: moduleType[] = [
  {
    name: "Bump Reminder",
    url: "bump-reminder",
    description: "Receive reminders when it’s time to bump your server.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Automation"
  },
  {
    name: "Anti Bot",
    url: "anti-bot",
    description: "Protect your server from spam and malicious bots.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Moderation"
  },
  {
    name: "Analytics",
    url: "analytics",
    description: "View server activity and popular channels at a glance.",
    free: false,
    enabled: true,
    inDevelopment: false,
    category: "Analytics / Tracking"
  },
  {
    name: "Auto Role",
    url: "auto-role",
    description: "Automatically assign roles to new members joining your server.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Moderation"
  },
  {
    name: "Birthday",
    url: "birthday",
    description: "Let members share birthdays and get notifications on them.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Events / Server Management"
  },
  {
    name: "Tickets",
    url: "tickets",
    description: "Manage member requests with an easy ticketing system.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Events / Server Management"
  },
  {
    name: "Logging",
    url: "logging",
    description: "Track server events like messages and voice activity.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Moderation"
  },
  {
    name: "Introduction",
    url: "introduction",
    description: "Set up how new members are welcomed and introduced.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Automation"
  },
  {
    name: "Invite Tracker",
    url: "invite-tracker",
    description: "See which invite links your members are using.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Analytics / Tracking"
  },
  {
    name: "Picture Contest",
    url: "picture-contest",
    description: "Run photo contests and pick winners automatically.",
    free: true,
    enabled: true,
    inDevelopment: true,
    category: "Fun / Engagement"
  },
  {
    name: "Youtube Watcher",
    url: "youtube-watcher",
    description: "Get notified when your favorite YouTube channels post.",
    free: true,
    enabled: true,
    inDevelopment: true,
    category: "Streaming / Media"
  },
  {
    name: "Twitch Watcher",
    url: "twitch-watcher",
    description: "Receive alerts when selected Twitch streamers go live.",
    free: false,
    enabled: true,
    inDevelopment: true,
    category: "Streaming / Media"
  },
  {
    name: "Kick Watcher",
    url: "kick-watcher",
    description: "Get notifications when favorite Kick streamers start streaming.",
    free: false,
    enabled: true,
    inDevelopment: true,
    category: "Streaming / Media"
  },
  {
    name: "Auto Message",
    url: "auto-message",
    description: "Send automated messages to channels on a schedule.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Automation"
  },
  {
    name: "Welcome Message",
    url: "welcome-message",
    description: "Send messages automatically when new members join.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Automation"
  },
  {
    name: "Leave Message",
    url: "leave-message",
    description: "Notify the server when a member leaves automatically.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Automation"
  },
  {
    name: "Leveling",
    url: "leveling",
    description: "Add a leveling system for members based on activity.",
    free: true,
    enabled: true,
    inDevelopment: true,
    category: "Events / Server Management"
  },
  {
    name: "Channel of Fame",
    url: "channel-of-fame",
    description: "Show starred messages in a special channel automatically.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Fun / Engagement"
  },
  {
    name: "Giveaway",
    url: "giveaway",
    description: "Host giveaways and let members win prizes easily.",
    free: true,
    enabled: true,
    inDevelopment: true,
    category: "Fun / Engagement"
  },
  {
    name: "Minecraft",
    url: "minecraft",
    description: "Display online players and status of your Minecraft server.",
    free: true,
    enabled: true,
    inDevelopment: false,
    category: "Streaming / Media"
  },
  {
    name: "Mod Link",
    url: "mod-link",
    description: "Synchronize moderation actions across multiple servers automatically.",
    free: false,
    enabled: false,
    inDevelopment: true,
    category: "Moderation"
  },
  {
    name: "Message Glue",
    url: "message-glue",
    description: "Keep a specific message pinned as the last message.",
    free: true,
    enabled: false,
    inDevelopment: true,
    category: "Fun / Engagement"
  },
  {
    name: "Streak",
    url: "streak",
    description: "Reward members for daily activity and maintain streaks.",
    free: true,
    enabled: true,
    inDevelopment: true,
    category: "Fun / Engagement"
  },
  {
    name: "Time Keeper",
    url: "time-keeper",
    description: "Set personal or server reminders for important moments.",
    free: true,
    enabled: false,
    inDevelopment: true,
    category: "Analytics / Tracking"
  },
  {
    name: "Boost Spotlight",
    url: "boost-spotlight",
    description: "Celebrate and notify whenever someone boosts your server.",
    free: true,
    enabled: false,
    inDevelopment: true,
    category: "Streaming / Media"
  },
  {
    name: "Git Buddy",
    url: "git-buddy",
    description: "Track bugs, requests, and issues directly in Discord.",
    free: true,
    enabled: false,
    inDevelopment: true,
    category: "Events / Server Management"
  },
  {
    name: "QOTD",
    url: "qotd",
    description: "Send daily or weekly a question in a channel to simulate interaction",
    free: true,
    enabled: false,
    inDevelopment: true,
    category: "Fun / Engagement"
  },
  {
    name: "Server Backups",
    url: "server-backups",
    description: "Backup channels, roles and settings to restore later",
    free: false,
    enabled: false,
    inDevelopment: true,
    category: "Events / Server Management"
  },
  {
    name: "Server Anniversary",
    url: "server-anniversary",
    description: "Celebrate your server's milestones each year.",
    free: true,
    enabled: false,
    inDevelopment: true,
    category: "Events / Server Management"
  }
];

export default modules;