"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpArticlesType } from "@/app/types/helpArticles";
import { getHelpArticles } from "@/app/lib/getHelpArticles";

export default function HelpArticlesPage() {
  const [articles, setArticles] = useState<HelpArticlesType[]>([]);

  useEffect(() => {
    async function fetchArticles() {
      const data = await getHelpArticles();

      setArticles(data);
    }
    void fetchArticles();
  }, []);

  return (
    <div className="px-6 md:px-20 py-12 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-6">Help articles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: HelpArticlesType) => (
          <Link
            key={article.slug}
            href={`/help/${article.slug}`}
            className="block bg-[#14171f] p-6 rounded-lg hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-white mb-2">{article.title}</h2>


            <p className="text-gray-400 text-sm mb-3">{article.description}</p>
            {article.author?.name && <p className="text-gray-500 text-xs">By {article.author?.name}</p>}
          </Link>
        ))}
      </div>

    </div>
  );
}