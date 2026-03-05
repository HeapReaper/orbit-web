import ModuleSection from "./components/sections/ModuleSection";
import BotInfo from "@/app/(dashboard)/dashboard/components/sections/BotInfo";

export default async function DashboardPage() {
  return (
    <div className="space-y-8">
      <title>Dashboard</title>
      <BotInfo />

      <ModuleSection />
    </div>
  );
}
