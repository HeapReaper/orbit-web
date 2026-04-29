import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, User, Tag } from "lucide-react";
import { getAllArticles } from "@/app/lib/articles";
import { formatDate } from "@/app/lib/formatDate";

export const metadata: Metadata = {
  title: "Articles | Orbit",
  description: "Tips, guides and updates about Orbit and Discord server management.",
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <main className="min-h-screen bg-[#0d0f13] text-gray-300">
      <div className="px-6 md:px-20 py-12 min-h-screen">
        <h1 className="text-4xl font-bold text-white mb-6">Articles</h1>
        <p className="text-gray-400 mb-6">
          Tips, guides and updates about Orbit and Discord server management.
        </p>

        {articles.length === 0 ? (
          <p className="text-gray-500">No articles yet. Check back soon!</p>
        ) : (
          <div className="flex flex-col gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group block bg-[#14171f] border border-[#1f2230] rounded-xl p-6 hover:border-purple-700 transition-colors"
              >
                <h2 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors mb-2">
                  {article.title}
                </h2>
                {article.description && (
                  <p className="text-gray-400 mb-4 leading-relaxed">{article.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {article.date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(article.date)}
                    </span>
                  )}
                  {article.author && (
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {article.author}
                    </span>
                  )}
                  {article.tags.length > 0 && (
                    <span className="flex items-center gap-2">
                      <Tag size={14} />
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}