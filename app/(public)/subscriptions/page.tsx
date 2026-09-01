import type { Metadata } from "next";
import React from "react";

interface PlansProps {
  name: string;
  description: string;
  price: string;
  nonFeatures?: string[];
  features?: string[];
  buttonText: string;
  buttonClass: string;
}

export const metadata: Metadata = {
  title: "Orbit – Free for everyone",
  description: "All Orbit features are available for free.",
};

export default function Page() {
  const plans: PlansProps[] = [{
    name: "🤗 Free",
    description: "Every Orbit feature, available to every server.",
    price: "€ 0 / month",
    features: ["All modules", "All analytics and logs", "Community support"],
    buttonText: "Free forever",
    buttonClass: "bg-green-600 cursor-default",
  }];

  return (
    <main className="min-h-screen bg-[#0d0f13] text-gray-300 ">
      <div className="px-6 md:px-20 py-12 min-h-screen">
        <h1 className="text-4xl font-bold text-white mb-6">Free for everyone</h1>
        <p className="text-gray-400 mb-2">
          Every Orbit feature is available at no cost. There are no paid tiers
          or feature restrictions.
        </p>

        <div className="mb-6 p-4 bg-[#1f2330] border border-gray-700 rounded text-gray-200">
          🚀 Add Orbit to your server and use the complete feature set for free.
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-[#14171f] rounded-lg p-6 shadow hover:shadow-lg transition border border-gray-800 hover:border-blue-600"
            >
              <h2 className="text-2xl font-semibold text-white mb-2">
                {plan.name}
              </h2>
              <p className="text-gray-400 mb-4">{plan.description}</p>
              <p className="text-gray-300 font-medium mb-4">{plan.price}</p>

              <ul className="mb-6 space-y-2">
                {plan.features &&
                  plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <span className="mr-2 text-[var(--primary-color)]">
                        ✔
                      </span>{" "}
                      {feature}
                    </li>
                  ))}

                {plan.nonFeatures &&
                  plan.nonFeatures.map((nonFeature: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <span className="mr-2 text-[var(--primary-color)]">
                        ✗
                      </span>{" "}
                      {nonFeature}
                    </li>
                  ))}
              </ul>

              <button
                className={`w-full text-white px-4 py-2 rounded font-medium transition ${plan.buttonClass}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
