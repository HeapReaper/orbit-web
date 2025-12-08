import type { Metadata } from "next";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";
import { formatDate } from "@/app/lib/formatDate";
import {Calendar} from "lucide-react";
import React from "react";

export const metadata: Metadata = {
  title: "Terms of Service – Orbit",
  description:
    "Read the Orbit Terms of Service to understand the rules and responsibilities for using our Discord bot, dashboard, and related services.",
};

async function getTerms() {
  const data = await fetch(`${process.env.DIRECTUS_URL}/items/Terms`, {
    next: {
      revalidate: 30
    }
  });

  const json = await data.json();
  return json.data;
}

export default async function TermsOfService() {
  const data = await getTerms();

  return (
    <article className="min-h-screen bg-[#0d0f13] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">
          Terms of Service
        </h1>

        <span className="inline-flex items-center gap-1">
          <Calendar size={16} className="inline-block text-blue-500" />
          {new Date(data.date_created).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>

        <div className="space-y-8 mx-auto">
          <ShowMarkdown
            content={data.content}
          />
        </div>
      </div>
    </article>
  );
}