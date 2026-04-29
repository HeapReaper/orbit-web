import React from "react";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import { getAllArticles } from "@/app/lib/articles";
import { formatDate } from "@/app/lib/formatDate";

export default function LatestArticlesSection() {
  const articles = getAllArticles().slice(0, 3);

  if (articles.length === 0) return null;

  return (
    <section className="px-6 md:px-20 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8 gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Latest Articles</h2>
          <Link
            href="/articles"
            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex flex-col bg-[#14171f] border border-[#1f2230] rounded-xl p-5 hover:border-purple-700 transition-colors"
            >
              <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors mb-2 leading-snug">
                {article.title}
              </h3>
              {article.description && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
                  {article.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-auto">
                {article.date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(article.date)}
                  </span>
                )}
                {article.author && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {article.author}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}