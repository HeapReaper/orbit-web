import modules from "@/app/(dashboard)/dashboard/data/modules";
import { moduleType } from "@/app/types/modules";
import FreeLabel from "@/app/(dashboard)/dashboard/components/labels/Free";
import FreemiumLabel from "@/app/(dashboard)/dashboard/components/labels/Freemium";
import PremiumLabel from "@/app/(dashboard)/dashboard/components/labels/Premium";
import React from "react";

const groupedModules = modules.reduce(
  (acc: Record<string, moduleType[]>, module) => {
    const category = module.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  },
  {},
);

export default function BotModulesSection() {
  const renderLabel = (tier: moduleType["tier"]) => {
    switch (tier) {
      case "free":
        return <FreeLabel />;
      case "freemium":
        return <FreemiumLabel />;
      case "premium":
        return <PremiumLabel />;
      default:
        return null;
    }
  };

  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        Bot modules
      </h2>

      {Object.entries(groupedModules).map(([category, modulesInCategory]) => (
        <div key={category} className="mb-12">
          <h3 className="text-2xl font-semibold text-white mb-6">{category}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {modulesInCategory.map((module: moduleType) => (
              <div
                key={module.url}
                className="p-6 rounded-lg hover:shadow-lg transition bg-[#14171f] hover:border-blue-600 border border-gray-900"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-semibold">{module.name}</h4>
                  {renderLabel(module.tier)}
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
        </div>
      ))}
    </section>
  );
}
