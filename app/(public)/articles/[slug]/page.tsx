import { Metadata } from "next";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";
import React from "react";
import { Calendar, User } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Article?fields=*,Author.*,Category.*&filter[slug][_eq]=${slug}`,
    { next: { revalidate: 30 } }
  );

  console.log(`${process.env.DIRECTUS_URL}/items/Article?fields=*,Author.*,Category.*&filter[slug][_eq]=${slug}`)

  const data = await res.json();
  return data.data?.[0] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article not found – Orbit",
      description: "This article could not be found.",
      openGraph: {
        title: "Article not found – Orbit",
        description: "This article could not be found.",
        type: "article",
      },
      twitter: {
        card: "summary",
        title: "Article not found – Orbit",
        description: "This article could not be found.",
      },
    };
  }

  return {
    title: `${article.title} – Orbit`,
    description: article.description ?? "Read this article on Orbit.",
    openGraph: {
      title: `${article.title} – Orbit`,
      description: article.description ?? "",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} – Orbit`,
      description: article.description ?? "",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className="flex justify-center px-4 md:px-10 py-8">
        <p className="text-gray-400">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-10 py-8">
      <article className="max-w-3xl mx-auto px-6 md:px-0 py-16 text-white prose prose-invert">
        <h1 className="text-4xl font-bold mb-2">{article.title}</h1>

        {/* Author + Updated */}
        <p className="text-gray-400 text-sm flex items-center gap-2">
        <span className="inline-flex items-center gap-1">
          <User size={16} className="inline-block text-blue-500" />
          {article.Author.name ?? "Unknown"}
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