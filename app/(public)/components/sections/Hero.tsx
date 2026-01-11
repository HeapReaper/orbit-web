"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function HeroSection() {
  const joinDiscordButtonRef = useRef<HTMLAnchorElement | null>(null);
  const addServerButtonRef = useRef<HTMLAnchorElement | null>(null);

  const handleConfettiClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    ref: React.RefObject<HTMLAnchorElement | null>,
    url: string,
  ) => {
    e.preventDefault();

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const originX = x / window.innerWidth;
      const originY = y / window.innerHeight;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: originX, y: originY },
      });
    }

    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    }, 1000);
  };

  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-20">
      <div className="md:w-1/2 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Welcome to Orbit
        </h1>
        <p className="text-gray-400 text-lg md:text-xl">
          Take your Discord server to Orbit. Orbit is a powerful Discord bot
          that helps you manage, engage, and grow your server effortlessly. From
          moderation to analytics and community engagement, Orbit offers all the
          tools you need in a sleek dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-semibold rounded-lg transition text-center"
          >
            Go to Dashboard
          </Link>

          <a
            ref={addServerButtonRef}
            href="https://discord.com/oauth2/authorize?client_id=1424327630706184343&scope=bot%20applications.commands&permissions=8"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) =>
              handleConfettiClick(
                e,
                addServerButtonRef,
                "https://discord.com/oauth2/authorize?client_id=1424327630706184343&scope=bot%20applications.commands&permissions=8",
              )
            }
            className="inline-block px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-semibold rounded-lg transition text-center"
          >
            Add to your server
          </a>
        </div>

        <a
          ref={joinDiscordButtonRef}
          href="https://discord.gg/HyGNHZCeTQ"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) =>
            handleConfettiClick(
              e,
              joinDiscordButtonRef,
              "https://discord.com/oauth2/authorize?client_id=1424327630706184343&scope=bot%20applications.commands&permissions=8",
            )
          }
          className="inline-block px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-semibold rounded-lg transition text-center"
        >
          Join our Discord
        </a>
      </div>

      <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
        <Image
          src="/logo.png"
          alt="Orbit Logo"
          width={300}
          height={300}
          priority
          className="animate-spin-ultra-slow"
        />
      </div>
    </section>
  );
}
