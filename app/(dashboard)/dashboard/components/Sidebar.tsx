"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Lock,
  Play,
  Package,
  Home,
  SquareChevronRight,
  ClipboardClock,
  ChartColumn,
  Settings,
  Activity,
  Zap,
  TriangleAlert,
} from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import modules from "../data/modules";
import SelectInput from "@/app/(dashboard)/dashboard/components/inputs/Select";
import Link from "next/link";
import { useGuild } from "@/app/context/GuildContext";
import AddBot from "@/app/(dashboard)/dashboard/components/buttons/AddBot";
import FreeLabel from "@/app/(dashboard)/dashboard/components/labels/Free";
import JoinOurDiscord from "@/app/(dashboard)/dashboard/components/buttons/JoinOurDiscord";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    selectedGuild,
    setSelectedGuild,
    guilds,
    setGuilds,
    needsReauth,
    setNeedsReauth,
  } = useGuild();
  const pathname = usePathname();

  const sortAndFilterModules = modules
    .filter((module) => module.enabled)
    .filter((module) => module.name !== "Analytics")
    .sort((a, b) => a.name.localeCompare(b.name));

  const isActive = (href: string) => {
    return href === pathname;
  };

  useEffect(() => {
    const fetchUserGuilds = async () => {
      try {
        const res = await fetch("/api/discord/guilds");
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("Failed to fetch guilds");
          setNeedsReauth(data?.reauth === true);
          setGuilds([]);
          return;
        }

        if (!data.guilds) {
          setGuilds([]);
          return;
        }

        setNeedsReauth(false);

        const saved: string | null = localStorage.getItem("selectedGuild");
        // @ts-ignore
        if (saved && data.guilds.some((g) => g.id === saved)) {
          setSelectedGuild(saved);
        }
        setGuilds(data.guilds);

        setGuilds(data.guilds);
      } catch (err) {
        console.error(err);
        setGuilds([]);
      }
    };

    void fetchUserGuilds();
  }, [setGuilds, setSelectedGuild, setNeedsReauth]);

  useEffect(() => {
    if (selectedGuild) {
      localStorage.setItem("selectedGuild", selectedGuild);
    }
  }, [selectedGuild, setSelectedGuild]);

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#14171f] p-4 transform transition-transform duration-200 ease-in-out z-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo + Profile */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-2xl font-bold text-white">
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="h-8 w-8 transition-transform duration-500 animate-spin-ultra-slow"
            />
            <span className="px-2 py-1">Orbit</span>
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User Avatar"}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border"
                  style={{ borderColor: "var(--primary-color)" }}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-700 border" />
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute mt-2 right-0 w-40 bg-[#1f222d] rounded-md shadow-lg z-50 flex flex-col py-2">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left px-4 py-2 hover:bg-gray-700 rounded-md text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden ml-2" onClick={() => setOpen(false)}>
            ✖
          </button>
        </div>

        {/* Guild select */}
        {needsReauth ? (
          <div className="mb-4 p-3 rounded-lg border border-yellow-700 bg-yellow-900/20">
            <div className="flex items-center gap-2 mb-1 text-yellow-200 font-semibold">
              <TriangleAlert className="w-5 h-5 shrink-0" />
              Session expired
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Your Discord login expired, so your servers could not be loaded.
            </p>
            <button
              type="button"
              onClick={() => signIn("discord", { callbackUrl: pathname })}
              className="w-full py-2 rounded bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium transition cursor-pointer"
            >
              Log in again
            </button>
          </div>
        ) : (
          <SelectInput
            label="Select server"
            value={selectedGuild}
            onChange={setSelectedGuild}
            options={guilds.map((g) => ({ value: g.id, label: g.name }))}
          />
        )}

        <nav className="flex flex-col space-y-2 text-gray-400 mt-4">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 hover:text-[var(--hover-color)] px-2 py-1 rounded-md ${isActive("/dashboard") ? "font-bold text-[var(--hover-color)]" : ""}`}
          >
            <Home className="w-6 h-6 text-[var(--primary-color)]" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/bot"
            className={`flex items-center gap-2 hover:text-[var(--hover-color)] px-2 py-1 rounded-md ${isActive("/dashboard/bot") ? "font-bold text-[var(--hover-color)]" : ""}`}
          >
            <Settings className="w-6 h-6 text-[var(--primary-color)]" />
            Settings
          </Link>

          <Link
            href="/dashboard/api"
            className={`flex items-center gap-2 hover:text-[var(--hover-color)] px-2 py-1 rounded-md ${isActive("/dashboard/api") ? "font-bold text-[var(--hover-color)]" : ""}`}
          >
            <Zap className="w-6 h-6 text-[var(--primary-color)]" />
            API
          </Link>

          <div>
            <button
              onClick={() => setModulesOpen(!modulesOpen)}
              className="flex justify-between items-center w-full px-2 py-1 hover:text-[var(--hover-color)] rounded-md"
            >
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-[var(--primary-color)]" />
                <span>Modules</span>
              </div>
              <span
                className={`transition-transform duration-200 ${
                  modulesOpen ? "rotate-90" : ""
                }`}
              >
                <Play className="w-6 h-6 text-[var(--primary-color)]" />
              </span>
            </button>

            {modulesOpen && (
              <div className="flex flex-col ml-4 mt-1 space-y-1 text-gray-300 cursor-pointer">
                {sortAndFilterModules.map((module, index: number) => (
                  <Link
                    key={index}
                    href={`/dashboard/modules/${module.url}`}
                    className={`hover:text-[var(--hover-color)]  px-2 py-1 rounded-md ${isActive(`/dashboard/modules/${module.url}`) ? "font-bold text-[var(--hover-color)]" : ""}`}
                  >
                    {module.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/modules/analytics"
            className={`flex items-center gap-2 hover:text-[var(--hover-color)] px-2 py-1 rounded-md ${isActive("/dashboard/modules/analytics") ? "font-bold text-[var(--hover-color)]" : ""}`}
          >
            <ChartColumn className="w-6 h-6 text-[var(--primary-color)]" />
            Analytics
          </Link>

          <Link
            href="/dashboard/logs"
            className={`flex items-center gap-2 hover:text-[var(--hover-color)] px-2 py-1 rounded-md ${isActive("/dashboard/logs") ? "font-bold text-[var(--hover-color)]" : ""}`}
          >
            <ClipboardClock className="w-6 h-6 text-[var(--primary-color)]" />
            Logs
          </Link>

          <a
            href="https://status.klikbit.nl"
            target="_blank"
            className={`flex items-center gap-2 hover:text-[var(--hover-color)] px-2 py-1 rounded-md ${isActive("/dashboard/logs") ? "font-bold text-[var(--hover-color)]" : ""}`}
          >
            <Activity className="w-6 h-6 text-[var(--primary-color)]" />
            Status ↗
          </a>

          {session?.user?.id === "632677231113666601" && (
            <Link
              href="/dashboard/owner"
              className="flex items-center gap-2 hover:text-[var(--hover-color)] px-2 py-1 rounded-md"
            >
              <Lock className="w-6 h-6 text-[var(--primary-color)]" />
              Owner Page
            </Link>
          )}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-2 w-full">
          <div><FreeLabel /></div>

          <div className="w-full">
            <AddBot />
            <JoinOurDiscord />
          </div>

          <p className="text-gray-300">
            A product by{" "}
            <span className="underline decoration-purple-700 hover:text-white">
              <a
                href="https://klikbit.nl"
                target="_blank"
                rel="noopener noreferrer"
              >
                KlikBit
              </a>
            </span>
          </p>
        </div>
      </aside>

      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#181b25] p-2 rounded-lg"
      >
        ☰
      </button>
    </>
  );
}
