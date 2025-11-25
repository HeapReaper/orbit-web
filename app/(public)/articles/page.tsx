"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArticleType } from "@/app/types/articles";
import { getLatestArticles } from "@/app/lib/getArticles";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    document.title = "Articles";
    async function fetchArticles() {
      const data = await getLatestArticles();
      setArticles(data);
    }
    void fetchArticles();
  }, []);

  const categories = ["All", ...Array.from(new Set(articles.map(a => a.category)))];
  const filteredArticles: ArticleType[] = filter === "All" ? articles : articles.filter(a => a.category === filter);

  return (
    <div className="px-6 md:px-20 py-12 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-6">Articles</h1>

      {/* Category filter */}
      {/*<div className="flex flex-wrap gap-3 mb-8">*/}
      {/*  {categories.map((cat) => (*/}
      {/*    <button*/}
      {/*      key={cat}*/}
      {/*      onClick={() => setFilter(cat)}*/}
      {/*      className={`px-4 py-2 rounded ${*/}
      {/*        filter === cat ? "bg-[var(--primary-color)] text-white" : "bg-gray-700 text-gray-200"*/}
      {/*      } hover:bg-[var(--primary-color)] transition`}*/}
      {/*    >*/}
      {/*      {cat}*/}
      {/*    </button>*/}
      {/*  ))}*/}
      {/*</div>*/}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article: ArticleType) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block bg-[#14171f] p-6 rounded-lg hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-white mb-2">{article.title}</h2>

            {article.category && (
              <p className="text-sm text-blue-400 mb-2">{article.category}</p>
            )}

            <p className="text-gray-400 text-sm mb-3">{article.description}</p>
            {article.author?.name && <p className="text-gray-500 text-xs">By {article.author?.name}</p>}
            <p className="text-gray-500 text-xs">
              On: {new Date(article.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </Link>
        ))}
      </div>

    </div>
  );
}
