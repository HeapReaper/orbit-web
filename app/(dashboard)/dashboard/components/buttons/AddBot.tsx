import React, { useRef } from "react";
import confetti from "canvas-confetti";

export default function AddBot() {
  // Type the ref as HTMLAnchorElement or null
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
        "https://discord.com/oauth2/authorize?client_id=1424327630706184343&scope=bot%20applications.commands&permissions=8",
        "_blank",
        "noopener,noreferrer",
      );
    }, 1000);
  };

  return (
    <div className="mt-2">
      <a
        ref={buttonRef}
        href="https://discord.com/oauth2/authorize?client_id=1424327630706184343&scope=bot%20applications.commands&permissions=8"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-block w-full py-1 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-semibold rounded-lg transition text-center"
      >
        Add bot
      </a>
    </div>
  );
}
