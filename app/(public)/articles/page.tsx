import type { Metadata } from "next";
import Link from "next/link";
import { getLatestArticles } from "@/app/lib/getArticles";
import { ArticleType } from "@/app/types/articles";

export const metadata: Metadata = {
  title: "Articles – Orbit",
  description:
    "Browse the latest articles from Orbit, including tutorials, updates, moderation guides, and community features.",
};

export default async function ArticlesPage() {
  const articles: ArticleType[] = await getLatestArticles();

  const categories = ["All", ...Array.from(new Set(articles.map(a => a.category)))];

  return (
    <div className="px-6 md:px-20 py-12 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-6">Articles</h1>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: ArticleType) => (
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

            {article.author?.name && (
              <p className="text-gray-500 text-xs">By {article.author.name}</p>
            )}

            <p className="text-gray-500 text-xs">
              On:{" "}
              {new Date(article.updatedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}