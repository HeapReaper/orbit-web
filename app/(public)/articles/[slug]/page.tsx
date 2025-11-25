import { Metadata } from "next";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";
import Link from "next/link";
import React from "react";
import {Calendar, User} from "lucide-react";
interface Props {
  params: { slug: string };
}

async function getArticle(slug: string) {
  const res = await fetch(
    `https://strapi.botinorbit.com/api/articles?filters[slug][$eq]=${slug}&populate=*`,
    { next: { revalidate: 60 } }
  );

  const data = await res.json();
  return data.data?.[0] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const article = await getArticle(slug);

  return {
    title: `${article.title}`,
    description: `${article.description}`,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = params;
  const article = await getArticle(slug);

  return (
    <div className="flex justify-center px-4 md:px-10 py-8">
      <article className="px-6 md:px-20 py-16 text-white prose prose-invert">
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>

        {/* Author + Updated */}
        <p className="text-gray-400 text-sm mb-8 flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <User size={16} className="inline-block text-blue-500" />
            {article.author?.name ?? "Unknown"}
          </span>
          •
          <span className="inline-flex items-center gap-1">
            <Calendar size={16} className="inline-block text-blue-500" />
            Created at: {new Date(article.updatedAt).toLocaleDateString()}
          </span>
        </p>

        <ShowMarkdown content={article.content} classes="" />
      </article>
    </div>
  );
}
