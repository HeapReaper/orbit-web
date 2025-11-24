import modules from "@/app/(dashboard)/dashboard/data/modules";
import {moduleType} from "@/app/types/modules";
import FreeLabel from "@/app/(dashboard)/dashboard/components/labels/Free";
import PremiumLabel from "@/app/(dashboard)/dashboard/components/labels/Premium";
import React from "react";

export default function BotModulesSection(){
  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-8">Bot Modules</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {modules.map((module: moduleType) => (
          <div
            key={module.url}
            className={`p-6 rounded-lg hover:shadow-lg transition bg-[#14171f]  hover:border-blue-600 border border-gray-900`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold ">{module.name}</h3>
              {module.free ? (
                <FreeLabel />
              ) : (
                <PremiumLabel />
              )}
            </div>
            <p className="text-gray-400 mb-4">{module.description}</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                module.inDevelopment
                  ? "bg-gray-700 text-gray-300"
                  : "bg-green-500 text-black"
              }`}
            >
                {module.inDevelopment ? "In development" : "Available"}
              </span>
          </div>
        ))}
      </div>
    </section>
  );
}