import React, { useRef } from "react";
import confetti from "canvas-confetti";

export default function JoinOurDiscord() {
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

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
      window.open(
        "https://discord.gg/HyGNHZCeTQ",
        "_blank",
        "noopener,noreferrer"
      );
    }, 100);
  };

  return (
    <div className="mt-2">
      <a
        ref={buttonRef}
        href="https://discord.gg/HyGNHZCeTQ"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-block w-full py-1 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-semibold rounded-lg transition text-center"
      >
        Join our Discord
      </a>
    </div>
  );
}