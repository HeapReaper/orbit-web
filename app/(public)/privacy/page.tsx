import type { Metadata } from "next";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";
import { formatDate } from "@/app/lib/formatDate";
import { Calendar } from "lucide-react";
import React from "react";

export const metadata: Metadata = {
  title: "Privacy Policy – Orbit",
  description:
    "Read Orbit's Privacy Policy to learn how we collect, use, and protect your personal data when using our Discord bot and dashboard.",
};

export default async function PrivacyPage() {
  return (
    <article className="min-h-screen bg-[#0d0f13] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">
          Privacy Policy
        </h1>

        <span className="inline-flex items-center gap-1">
          <Calendar size={16} className="inline-block text-blue-500" />
          5-3-2026
        </span>

        <div className="space-y-8 mx-auto">
          <p>
            1. Introduction

            Your privacy is important to us. This Privacy Policy explains how Orbit collects, uses, and protects your personal information when you access or use our platform, dashboard, or Discord integrations.
            2. Information We Collect

            We may collect personal information such as your Discord account details, usage data, and any information you provide directly through the platform. We do not sell your data to third parties.
            3. How We Use Your Information

            Your information is used to provide and improve our services, manage your account, send important updates, and comply with legal obligations.
            4. Data Sharing

            We do not share your personal information with third parties except when necessary to provide our services, comply with the law, or protect our rights and users.
            5. Security

            We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure.
            6. Your Rights

            You may request access, correction, or deletion of your personal data. Contact us if you have any questions or concerns about your data.
            7. Changes to This Policy

            We may update this Privacy Policy periodically. Any changes will be posted on this page with the effective date. Continued use of Orbit means you accept the updated policy.
            8. Contact

            For privacy questions, please contact us at support@klikbit.nl
          </p>
        </div>
      </div>
    </article>
  );
}
