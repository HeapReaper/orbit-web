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
  title: "Subscriptions – Orbit",
  description:
    "Explore Orbit’s subscription plans for your Discord server. Unlock premium modules, advanced moderation tools, extended logs, analytics, and lifetime options. Choose the plan that fits your community.",
};

export default function Page() {
  const plans: PlansProps[] = [
    {
      name: "🤗 Free",
      description:
        "Perfect for trying out basic features and managing smaller servers.",
      price: "€ 0 / month",
      nonFeatures: [],
      features: [
        "Free modules",
        "1 week logs",
        "Community support"
      ],
      buttonText: "Default plan",
      buttonClass: "bg-gray-700 cursor-not-allowed opacity-70 hover:bg-gray-700",
    },
    {
      name: "🚀 Premium",
      description:
        "Unlock advanced tools like the Anti Bot module and server analytics.",
      price: "€ 3.99 / month or € 40 / year",
      features: [
        "Premium modules",
        "1 month logs",
        "Support"
      ],
      buttonText: "Upgrade to premium",
      buttonClass: "bg-blue-600 hover:bg-blue-700 cursor-not-allowed",
    },
    {
      name: "🌟 Early Supporter",
      description:
        "A special limited-time deal for early users.",
      price: "€ 49 one-time",
      features: [
        "Premium modules",
        "All future premium updates",
        "Early Supporter badge",
        "Support (Limited)"
      ],
      buttonText: "Get Early Supporter Deal",
      buttonClass: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      name: "💎 Lifetime Premium",
      description:
        "Pay once and enjoy full premium access forever.",
      price: "€ 99.99 one-time",
      features: [
        "Premium modules",
        "All future premium updates",
        "Lifetime access",
        "Priority support"
      ],
      buttonText: "Buy Lifetime Access",
      buttonClass: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0d0f13] text-gray-300 ">
      <div className="px-6 md:px-20 py-12 min-h-screen">
        <h1 className="text-4xl font-bold text-white mb-6">Subscriptions</h1>
        <p className="text-gray-400 mb-2">
          <strong>(Coming soon)</strong> Choose the plan that fits your needs and unlock additional features
          for your server.
        </p>

        {/* Nieuwe banner voor nieuwe servers */}
        <div className="mb-6 p-4 bg-[#1f2330] border border-gray-700 rounded text-gray-200">
          🚀 Every new server gets 1 month of Premium trial, no setup or payment information needed.
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
                {plan.features && (
                  plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <span className="mr-2 text-[var(--primary-color)]">✔</span> {feature}
                    </li>
                  ))
                )}

                {plan.nonFeatures && (
                  plan.nonFeatures.map((nonFeature: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <span className="mr-2 text-[var(--primary-color)]">✗</span> {nonFeature}
                    </li>
                  ))
                )}
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
