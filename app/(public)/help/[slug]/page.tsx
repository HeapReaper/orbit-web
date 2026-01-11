import { notFound } from "next/navigation";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";
import { User, Calendar } from "lucide-react";
import { Metadata } from "next";
import React from "react";

export interface Props {
  slug: string;
}

async function getArticle(slug: string) {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Help?fields=*,author.*&filters[slug][_eq]=${slug}`,
    { next: { revalidate: 30 } },
  );

  const data = await res.json();
  return data.data?.[0] || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Props>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  return {
    title: `${article.title}`,
    description: `${article.description}`,
  };
}

export default async function HelpPage({ params }: { params: Promise<Props> }) {
  const { slug } = await params;

  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <div className="min-h-screen px-4 md:px-10 py-8">
      <article className="max-w-3xl mx-auto px-6 md:px-0 py-16 text-white prose prose-invert">
        <h1 className="text-4xl font-bold mb-2">{article.title}</h1>

        <p className="text-gray-400 text-sm flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <User size={16} className="inline-block text-blue-500" />
            {article.author.name ?? "Unknown"}
          </span>
          •
          <span className="inline-flex items-center gap-1">
            <Calendar size={16} className="inline-block text-blue-500" />
            {new Date(article.date_created).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </p>

        <ShowMarkdown content={article.content} classes="" />
      </article>
    </div>
  );
}
