import React from "react";
import {
  Shield,
  LayoutGridIcon,
  Package,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  File,
} from "lucide-react";
import modules from "@/app/(dashboard)/dashboard/data/modules";

export default async function CoreFeaturesSection() {
  const features = [
    {
      icon: (
        <Package className="text-[var(--primary-color)] w-10 h-10 mb-4 mx-auto" />
      ),
      title: `${modules.filter((m) => m.enabled).length} Modules`,
      description: `Enable modules like Streak, Auto Message, Kick Watcher, Minecraft and more with ease.`,
    },
    {
      icon: (
        <LayoutGridIcon className="text-[var(--primary-color)] w-10 h-10 mb-4 mx-auto" />
      ),
      title: "Dashboard",
      description:
        "A powerful, customizable web dashboard that lets you effortlessly enable, disable, and configure every feature.",
    },
    {
      icon: (
        <Sparkles className="text-[var(--primary-color)] w-10 h-10 mb-4 mx-auto" />
      ),
      title: "AI",
      description:
        "We've integrated AI in smart ways, from generating Question of the Day questions to funny bot mentions.",
    },
    {
      icon: (
        <File className="text-[var(--primary-color)] w-10 h-10 mb-4 mx-auto" />
      ),
      title: "Embeds",
      description:
        "We're also supporting embeds, so you can configure messages precisely",
    },
  ];

  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        Core Features
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-[#14171f] p-6 rounded-lg text-center hover:shadow-lg hover:border-blue-600 border border-gray-900 transition"
          >
            {feature.icon}
            <h3 className="text-xl font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
