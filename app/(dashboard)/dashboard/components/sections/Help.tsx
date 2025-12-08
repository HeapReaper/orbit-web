import { BookOpen } from "lucide-react";
import React from "react";

interface HelpArticlesType {
  title: string;
  slug: string;
  author: any;
  content: string;
  description: string;
}

async function getArticles() {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Help?fields=*,author.*`,
    { next: { revalidate: 30 } }
  );

  const data = await res.json();

  return data.data || null;
}

export default async function HelpArticles() {
  const articles: HelpArticlesType[] = await getArticles();

  return (
    <section className="bg-[#181b25] p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-8 h-8 text-[var(--primary-color)]" />
        <h2 className="text-2xl font-semibold">Help Articles</h2>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {articles.map((article) => (
          <a
            key={article.title}
            href={`/help/${article.slug}`}
            className="bg-[#14171f] p-4 rounded-lg hover:border-blue-600 border border-gray-900 transition-colors flex flex-col gap-2 shadow-sm"
          >
            <h3 className="text-white font-semibold">{article.title}</h3>
            <p className="text-gray-400 text-sm">{article.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}