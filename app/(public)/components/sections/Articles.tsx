import React from "react";
import Link from "next/link";

interface Article {
  title: string;
  slug: string;
  description: string;
}

async function getDirectusArticles(): Promise<Article[]> {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Article?fields=title,slug,description&limit=4`,
    { next: { revalidate: 60 } }
  );

  const data = await res.json();

  return data.data || [];
}

export default async function HelpSection() {
  const articles = await getDirectusArticles();

  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        Help
      </h2>

      <div className="flex flex-wrap justify-center gap-8">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="bg-[#14171f] p-6 rounded-lg hover:shadow-lg transition hover:border-blue-600 border border-gray-900"
          >
            <h3 className="text-xl font-semibold mb-2 text-white">
              {article.title}
            </h3>
            <p className="text-gray-400 text-sm">{article.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}