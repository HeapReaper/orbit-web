import type { Metadata } from "next";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";
import { formatDate } from "@/app/lib/formatDate";

export const metadata: Metadata = {
  title: "Terms of Service – Orbit",
  description:
    "Read the Orbit Terms of Service to understand the rules and responsibilities for using our Discord bot, dashboard, and related services.",
};

async function getTerms() {
  const data = await fetch(`${process.env.DIRECTUS_URL}/items/Terms`, {
    next: {
      revalidate: 30
    }
  });

  const json = await data.json();
  return json.data;
}


export default async function TermsOfService() {
  const data = await getTerms();

  return (
    <article className="min-h-screen bg-[#0d0f13] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">
          Terms of Service
        </h1>

        <p className="text-gray-400 mb-10">Last updated: {formatDate(data.date_created)}</p>

        <div className="space-y-8 mx-auto">
          <ShowMarkdown
            content={data.content}
          />
        </div>
      </div>
    </article>
  );
}