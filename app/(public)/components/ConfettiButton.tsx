import React, { useRef } from "react";
import confetti from "canvas-confetti";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  addConfetti?: boolean;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  children,
  target,
  rel,
  addConfetti = false,
}) => {
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!addConfetti) return;

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
      window.open(href, target || "_self", rel || undefined);
    }, 50);
  };

  return (
    <a
      ref={buttonRef}
      href={href}
      target={target}
      rel={rel}
      onClick={addConfetti ? handleClick : undefined}
      className="inline-block px-6 py-3 bg-[var(--primary-color)] hover:bg-[var(--hover-color)] text-white font-semibold rounded-lg transition text-center"
    >
      {children}
    </a>
  );
};

export default LinkButton;
