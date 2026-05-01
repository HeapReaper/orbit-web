import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import ShowMarkdown from "@/app/(public)/components/showMarkdown";

export const metadata: Metadata = {
  title: "About Us – Orbit",
  description: "Learn more about Orbit and the team behind it.",
};

function getAboutContent(): string {
  const filePath = path.join(process.cwd(), "content", "about-us.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match ? match[1] : raw;
}

export default function AboutPage() {
  const content = getAboutContent();

  return (
    <main className="min-h-screen bg-[#0d0f13] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">
          About Us
        </h1>
        <ShowMarkdown content={content} />
      </div>
    </main>
  );
}