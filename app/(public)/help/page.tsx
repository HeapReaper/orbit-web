import type { Metadata } from "next";
import Link from "next/link";
import { getHelpArticles } from "@/app/lib/getHelpArticles";
import { HelpArticlesType } from "@/app/types/helpArticles";

export const metadata: Metadata = {
  title: "Help Articles – Orbit",
  description:
    "Browse Orbit's help articles to learn how to manage your Discord server, use our bot, and troubleshoot common issues.",
};

export default async function HelpArticlesPage() {
  const articles: HelpArticlesType[] = await getHelpArticles();

  return (
    <div className="px-6 md:px-20 py-12 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-6">Help Articles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: HelpArticlesType) => (
          <Link
            key={article.slug}
            href={`/help/${article.slug}`}
            className="block bg-[#14171f] p-6 rounded-lg hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-white mb-2">{article.title}</h2>
            <p className="text-gray-400 text-sm mb-3">{article.description}</p>
            {article.author?.name && (
              <p className="text-gray-500 text-xs">By {article.author?.name}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}