import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import NavType from "@/app/types/nav";

interface MobileDropdownProps {
  item: NavType;
  closeMenu?: () => void;
}

export default function MobileDropdown({
  item,
  closeMenu,
}: MobileDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full px-4 py-2 rounded hover:bg-[#1f222b] transition"
      >
        {item.name}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && item.children && (
        <ul className="flex flex-col ml-4 mt-1 gap-1">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href!}
                onClick={() => {
                  setOpen(false);
                  closeMenu?.();
                }}
                className="block px-4 py-2 rounded hover:bg-[#1f222b] transition"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
