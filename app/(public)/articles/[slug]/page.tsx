import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import { getArticleBySlug, getAllArticles } from "@/app/lib/articles";
import { formatDate } from "@/app/lib/formatDate";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | Orbit`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-[#0d0f13] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          All articles
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{article.title}</h1>

        {article.description && (
          <p className="text-gray-400 text-lg mb-6 leading-relaxed">{article.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-10 pb-10 border-b border-[#1f2230]">
          {article.date && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(article.date)}
            </span>
          )}
          {article.author && (
            <span className="flex items-center gap-1">
              <User size={14} />
              {article.author}
            </span>
          )}
          {article.tags.length > 0 && (
            <span className="flex items-center gap-2">
              <Tag size={14} />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>

        <ShowMarkdown content={article.content} />
      </div>
    </main>
  );
}