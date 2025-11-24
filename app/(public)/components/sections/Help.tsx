import helpData from "@/app/(dashboard)/dashboard/data/helpData";
import React from "react";

export default function HelpSection() {
  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-8">Help</h2>

      <div className="grid md:grid-cols-3 gap-8">
        {helpData.map((article) => (
          <a
            key={article.title}
            href={article.link}
            className="bg-[#14171f] p-6 rounded-lg hover:shadow-lg transition hover:border-blue-600 border border-gray-900"
          >
            <h3 className="text-xl font-semibold mb-2 text-white">
              {article.title}
            </h3>
            <p className="text-gray-400 text-sm">{article.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}