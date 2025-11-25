import { useState } from "react";
import Link from "next/link";
import NavType from "@/app/types/nav";

interface DropdownProps {
  item: NavType;
  closeMenu?: () => void;
}

export default function Dropdown({ item, closeMenu }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <li className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 font-medium hover:text-[var(--primary-color)] transition"
      >
        {item.name}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && item.children && (
        <ul className="absolute top-full left-0 mt-2 bg-[#14171f] border border-gray-800 rounded shadow-lg w-48">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href!}
                onClick={closeMenu}
                className="block px-4 py-2 hover:bg-[#1f222b] transition"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
