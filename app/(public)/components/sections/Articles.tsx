import React from "react";
import Link from "next/link";

interface ArticleType {
  id: number;
  title: string;
  description: string;
  author: { name: string } | null;
  updatedAt: string;
  slug: string;
}

async function getLatestArticles(): Promise<ArticleType[]> {
  const res = await fetch(
    "https://strapi.botinorbit.com/api/articles?populate=*&sort=createdAt:desc&pagination[limit]=4",
    { next: { revalidate: 60 } }
  );

  const data = await res.json();
  if (!data.data) return [];

  return data.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    author: item.author || null,
    updatedAt: item.updatedAt,
    slug: item.slug,
  }));
}

export default async function LatestArticlesSection() {
  const articles = await getLatestArticles();
  if (!articles || articles.length === 0) return null;

  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        Latest Articles
      </h2>

      <div className="flex flex-wrap justify-center gap-8">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="w-full max-w-xs bg-[#14171f] p-6 rounded-lg hover:shadow-lg hover:border-blue-600 border border-gray-900 transition"
          >
            <h3 className="text-xl font-semibold mb-2 text-white">
              {article.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{article.description}</p>
            <p className="text-gray-400 text-xs">
              {article.author?.name ? `By ${article.author.name}` : "By Unknown"} •{" "}
              {new Date(article.updatedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}