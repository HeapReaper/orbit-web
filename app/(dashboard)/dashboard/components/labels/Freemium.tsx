import { Star } from "lucide-react";

export default function FreemiumLabel() {
  return (
    <div className="mt-2">
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-semibold text-white bg-blue-500 rounded-full">
        <Star />
        Freemium
      </span>
    </div>
  );
}