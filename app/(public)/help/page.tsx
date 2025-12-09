import type { Metadata } from "next";
import Link from "next/link";
import { HelpArticlesType } from "@/app/types/helpArticles";
import { Calendar, User } from "lucide-react";
import React from "react";

export const metadata: Metadata = {
  title: "Help Articles – Orbit",
  description:
    "Browse Orbit's help articles to learn how to manage your Discord server, use our bot, and troubleshoot common issues.",
};

async function getArticles() {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Help?fields=*,author.*&sort[]=-date_created`,
    { next: { revalidate: 30 } }
  );

  const data = await res.json();

  return data.data || null;
}

export default async function HelpArticlesPage() {
  const articles: HelpArticlesType[] = await getArticles();

  return (
    <div className="px-6 md:px-20 py-12 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-6">Help Articles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: HelpArticlesType) => (
          <Link
            key={article.slug}
            href={`/help/${article.slug}`}
            className="block bg-[#14171f] p-6 rounded-lg hover:shadow-lg transition border border-gray-800 hover:border-blue-600"
          >
            <h2 className="text-xl font-bold text-white mb-2">{article.title}</h2>
            <p className="text-gray-400 text-sm mb-3">{article.description}</p>

            <p className="text-gray-400 text-sm  flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <User size={16} className="inline-block text-blue-500" />
                {article.author.name ?? "Unknown"}
              </span>
                  •
              <span className="inline-flex items-center gap-1">
                <Calendar size={16} className="inline-block text-blue-500" />
                  {new Date(article.date_created).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}