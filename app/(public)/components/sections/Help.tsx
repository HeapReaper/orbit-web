import React from "react";
import Link from "next/link";

interface HelpArticles {
  title: string;
  slug: string;
  author: any;
  content: string;
  description: string;
}

async function getArticle() {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Help?fields=*,author.*`,
    { next: { revalidate: 30 } }
  );

  const data = await res.json();

  return data.data || null;
}

export default async function HelpSection() {
  const articles: HelpArticles[] = await getArticle();

  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        Help
      </h2>

      <div className="flex flex-wrap justify-center gap-8">
        {articles.map((article) => (
          <Link
            key={article.title}
            href={`/help/${article.slug}`}
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