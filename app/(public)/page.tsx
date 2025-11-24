import React from "react";
import HeroSection from "@/app/(public)/components/sections/Hero";
import StatisticsSection from "@/app/(public)/components/sections/Statistics";
import ReviewsSection from "@/app/(public)/components/sections/Reviews";
import OurTeamSection from "@/app/(public)/components/sections/Ourteam";
import ScreenshotsSection from "@/app/(public)/components/sections/Screenshots";
import BotModulesSection from "@/app/(public)/components/sections/BotModules";
import HelpSection from "@/app/(public)/components/sections/Help";
import LatestArticlesSection from "@/app/(public)/components/sections/Articles";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#0d0f13] text-white">
      {/* Hero */}
      <div className="">
        <HeroSection />
      </div>

      {/* Statistics */}
      <div className="bg-[#101218]">
        <StatisticsSection />
      </div>

      {/* Review Section */}
      <div className="">
        <ReviewsSection />
      </div>

      {/* Latest articles */}
      <div className="bg-[#101218]">
        <LatestArticlesSection />
      </div>

      {/* Our Team Section */}
      <div className="">
        <OurTeamSection />
      </div>

      {/* Bot Modules */}
      <div className="bg-[#101218]">
        <BotModulesSection />
      </div>

      {/* Screenshots Section */}
      <div className="">
        <ScreenshotsSection />
      </div>

      {/* Help section */}
      <div className="bg-[#101218]">
        <HelpSection />
      </div>
    </main>
  );
}