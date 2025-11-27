import Image from "next/image";
import React from "react";

export default function ScreenshotsSection() {
  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        Config previews
      </h2>
      <div className="grid md:grid-cols-2 gap-10 items-center mt-16">
        <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/screenshots/server-backup-screenshot.png"
            alt="Server Backup Screenshot"
            width={600}
            height={350}
            className="rounded-lg border border-[var(--primary-color)]"
          />
        </div>
        <div className="order-1 md:order-2 space-y-4">
          <h3 className="text-2xl font-semibold">Server Backup</h3>
          <p className="text-gray-400">
            Backup your server’s channels, category and channel positions, server settings (name, region, icon), roles, and permissions.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Bot Settings</h3>
          <p className="text-gray-400">
            Manage global bot preferences and permissions directly from this page.
            Everything is synced automatically with your Discord server.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/screenshots/dashboard.png"
            alt="Bot Settings Screenshot"
            width={600}
            height={350}
            className="rounded-lg border border-[var(--primary-color)]"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center mt-16">
        <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/screenshots/bump_reminder.png"
            alt="Bump Reminder Screenshot"
            width={600}
            height={350}
            className="rounded-lg border border-[var(--primary-color)]"
          />
        </div>
        <div className="order-1 md:order-2 space-y-4">
          <h3 className="text-2xl font-semibold">Bump Reminder</h3>
          <p className="text-gray-400">
            Set automatic reminders for server bumps, helping your community stay visible on Discord lists.
            Fully configurable and easy to use.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center mt-16">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Auto message</h3>
          <p className="text-gray-400">
            Send automatic messages to your channels on a schedule.
            Perfect for announcements, server updates, or community engagement.
            Embeds and advanced customization are coming soon!
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/screenshots/auto_message_2.png"
            alt="Bot Settings Screenshot"
            width={600}
            height={350}
            className="rounded-lg border border-[var(--primary-color)]"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center mt-16">
        <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/screenshots/analytics.png"
            alt="Bump Reminder Screenshot"
            width={600}
            height={350}
            className="rounded-lg border border-[var(--primary-color)]"
          />
        </div>
        <div className="order-1 md:order-2 space-y-4">
          <h3 className="text-2xl font-semibold">Analytics</h3>
          <p className="text-gray-400">
            Get insight on what time your server is the most active, how many people have joined over time, active vs inactive members and more.
          </p>
        </div>
      </div>
    </section>
  );
}