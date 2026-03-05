import type { Metadata } from "next";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";
import { formatDate } from "@/app/lib/formatDate";
import { Calendar } from "lucide-react";
import React from "react";

export const metadata: Metadata = {
  title: "Terms of Service – Orbit",
  description:
    "Read the Orbit Terms of Service to understand the rules and responsibilities for using our Discord bot, dashboard, and related services.",
};

export default async function TermsOfService() {
  return (
    <article className="min-h-screen bg-[#0d0f13] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">
          Terms of Service
        </h1>

        <span className="inline-flex items-center gap-1">
          <Calendar size={16} className="inline-block text-blue-500" />
          5-3-2026
        </span>

        <div className="space-y-8 mx-auto">
          <p>
            1. Introduction

            Welcome to Orbit. By accessing or using our platform, dashboard, or Discord integrations, you agree to these Terms of Service. Please read them carefully before using any of our services. If you do not agree, you may not use Orbit or any related features.

            2. Eligibility

            You must be at least 13 years old to use Orbit. By using our services, you confirm that you meet this requirement and that you comply with all applicable laws and Discord’s Terms of Service.

            3. Use of Service

            Orbit provides tools for managing Discord bots, modules, and server configurations. You agree to use these tools responsibly and only for legitimate purposes. You may not:





            Attempt to disrupt or overload Orbit or its servers.



            Use the platform for malicious, illegal, or abusive purposes.



            Reverse engineer, copy, or redistribute any part of the service.

            4. Account & Security

            You are responsible for maintaining the security of your account and Discord credentials. Orbit is not liable for losses or damages resulting from unauthorized access caused by your actions or negligence.

            5. Third-Party Services

            Orbit integrates with Discord and may use other third-party APIs. We are not responsible for any issues, downtime, or data policies of these third-party platforms.

            6. Termination

            We reserve the right to suspend or terminate your access to Orbit at any time, with or without notice, if you violate these Terms or abuse the platform in any way.

            7. Limitation of Liability

            Orbit and its developers shall not be held liable for any damages, losses, or data breaches resulting from the use or inability to use our services. All tools are provided “as is” without warranties of any kind.

            8. Changes to Terms

            We may update these Terms of Service from time to time. Updates will be posted on this page with the new effective date. Continued use of Orbit after changes means you accept the updated terms.

            9. Contact

            For any questions or concerns about these Terms, please contact us at support@klikbit.nl.
          </p>
        </div>
      </div>
    </article>
  );
}
