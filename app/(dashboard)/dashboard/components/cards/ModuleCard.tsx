import FreeLabel from "@/app/(dashboard)/dashboard/components/labels/Free";
import FreemiumLabel from "@/app/(dashboard)/dashboard/components/labels/Freemium";
import PremiumLabel from "@/app/(dashboard)/dashboard/components/labels/Premium";
import { moduleType } from "@/app/types/modules";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function ModuleCard({
  name,
  description,
  url,
  tier,
  inDevelopment,
}: moduleType) {
  const renderLabel = () => {
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
    <Link
      href={`/dashboard/modules/${url}`}
      className="text-[var(--primary-color)] hover:text-[var(--hover-color)]"
    >
      <div className="bg-[#14171f] p-6 rounded-lg flex flex-col hover:shadow-lg hover:border-blue-600 border border-gray-900 transition">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white text-xl font-semibold">{name}</h3>
          {renderLabel()}
        </div>

        <p className="text-gray-400 mb-4">{description}</p>

        <div className="flex justify-between items-center">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              inDevelopment
                ? "bg-gray-700 text-gray-300"
                : "bg-green-500 text-black"
            }`}
          >
            {inDevelopment ? "In development" : "Available"}
          </span>

          <Link
            href={`/dashboard/modules/${url}`}
            className="text-[var(--primary-color)] hover:text-[var(--hover-color)]"
          >
            <Settings />
          </Link>
        </div>
      </div>
    </Link>
  );
}
