"use client";

import { useGuild } from "@/app/context/GuildContext";
import { useState, useRef, useEffect } from "react";
import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";

interface Category {
  id: string;
  name: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
  className?: string;
}

export default function CategorySelect({
  label,
  value,
  onChange,
  tooltip,
  className,
}: Props) {
  const { selectedGuild } = useGuild();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedGuild) {
      setCategories([]);
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `/api/discord/categories?guildId=${selectedGuild}`,
        );
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setCategories([]);
      }
    };

    void fetchCategories();
  }, [selectedGuild]);

  const allCategories = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string, label: string) => {
    onChange(val);
    setSearch(label);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!value) {
      setSearch(""); // Reset if no value found
      return;
    }
    const selected = allCategories.find((category) => category.value === value);
    if (selected) setSearch(selected.label);
  }, [value, categories]);

  const sortedCategories = allCategories
    .map((cat) => {
      const nameLower = cat.label.toLowerCase();
      const searchLower = search.toLowerCase();
      const index = nameLower.indexOf(searchLower);
      return { ...cat, matchIndex: index >= 0 ? index : Infinity };
    })
    .sort((a, b) => {
      if (a.matchIndex !== b.matchIndex) return a.matchIndex - b.matchIndex;
      return a.label.localeCompare(b.label);
    });

  return (
    <div className={className ?? "mb-4 relative"} ref={wrapperRef}>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-gray-400">{label}</label>

        {tooltip && <InfoTooltip text={tooltip} size={16} />}
      </div>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Select..."
          className="w-full bg-[#0d0f13] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] h-10"
        />

        {isOpen && (
          <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-[#0d0f13] border border-gray-700 rounded shadow-lg">
            {sortedCategories.map((category) => (
              <li
                key={category.value}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-700 ${
                  category.matchIndex === Infinity
                    ? "text-gray-500"
                    : "text-white"
                }`}
                onClick={() => handleSelect(category.value, category.label)}
              >
                {category.label}
              </li>
            ))}
          </ul>
        )}

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
