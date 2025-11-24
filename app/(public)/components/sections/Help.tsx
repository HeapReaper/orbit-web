import React from "react";
import Link from "next/link";

interface HelpArticles {
  title: string;
  slug: string;
  author: any;
  contentrich: string;
  description: string;
}

async function getHelpArticles() {
  const res = await fetch("https://strapi.botinorbit.com/api/helps?populate=*", {
    next: { revalidate: 60 },
  });

  const data = await res.json();
  return data.data;
}

export default async function HelpSection() {
  const articles: HelpArticles[] = await getHelpArticles();

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