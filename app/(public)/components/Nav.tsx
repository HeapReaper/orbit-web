"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavType from "@/app/types/nav";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Dropdown from "@/app/(public)/components/Dropdown";
import MobileDropdown from "@/app/(public)/components/MobileDropdown";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathName: string = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => {
    return pathName === href;
  };

  const navItems: NavType[] = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/subscriptions" },
    { name: "Servers", href: "/servers" },
    { name: "Articles", href: "/articles" },
    {
      name: "Info",
      children: [
        { name: "Preview", href: "/preview" },
        // { name: "Help articles", href: "/help" },
        // { name: "Terms of Services", href: "/terms" },
        // { name: "Privacy policy", href: "/privacy" },
        // { name: "Releases", href: "/releases" },
        {
          name: "Status ↗",
          href: "https://status.klikbit.nl",
          target: "_blank",
        },
      ],
    },
  ];

  return (
    <nav className="bg-[#14171f] text-white px-6 md:px-20 py-4 shadow-md  w-full z-50">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center ">
          <Image
            src="/logo.png"
            alt="Orbit Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="font-bold text-xl hover:text-[var(--primary-color)]">
            Orbit
          </span>
        </Link>

        <ul className="hidden md:flex gap-6 items-center">
          {navItems.map((item) =>
            item.children ? (
              <Dropdown key={item.name} item={item} />
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href!}
                  className={`hover:text-[var(--primary-color)] transition font-medium ${
                    isActive(item.href!)
                      ? "text-[var(--primary-color)] font-bold"
                      : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ),
          )}
          <li>
            {session ? (
              <Link href="/dashboard">Dashboard</Link>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </li>
        </ul>

        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
          >
            {menuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <ul className="md:hidden mt-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <li key={item.name} className="flex flex-col">
              {item.children ? (
                <MobileDropdown
                  item={item}
                  closeMenu={() => setMenuOpen(false)}
                />
              ) : (
                <Link
                  href={item.href!}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2 rounded transition ${
                    isActive(item.href!) ? "bg-[#1f222b]" : "hover:bg-[#1f222b]"
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}

          <li>
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded hover:bg-[#1f222b] transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded hover:bg-[#1f222b] transition"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
