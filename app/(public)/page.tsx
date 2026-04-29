import React from "react";
import HeroSection from "@/app/(public)/components/sections/Hero";
import StatisticsSection from "@/app/(public)/components/sections/Statistics";
import ScreenshotsSection from "@/app/(public)/components/sections/Screenshots";
import BotModulesSection from "@/app/(public)/components/sections/BotModules";
import CoreFeaturesSection from "@/app/(public)/components/sections/CoreFeatures";
import LatestArticlesSection from "@/app/(public)/components/sections/LatestArticles";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#0d0f13] text-white">
      {/* Hero */}
      <div className="">
        <HeroSection />
      </div>

      {/* Latest Articles */}
      <div className="bg-[#101218]">
        <LatestArticlesSection />
      </div>

      {/* Statistics */}
      <div className="bg-[#101218]">
        <StatisticsSection />
      </div>

      {/* Core Features */}
      <div className="bg-[#101218]">
        <CoreFeaturesSection />
      </div>

      {/* Bot Modules */}
      <div className="">
        <BotModulesSection />
      </div>

    </main>
  );
}
