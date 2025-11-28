"use client";

import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import React, { useState } from "react";

interface Item {
  id: string;
  name: string;
}

interface Props<T extends Item> {
  label: string;
  toolTip?: string;
  items: T[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  placeholder?: string;
}

export default function CheckList<T extends Item>({
  label,
  toolTip,
  items,
  selectedIds,
  onToggle,
  placeholder = "Search...",
}: Props<T>) {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-gray-400">{label}</label>
        {toolTip && <InfoTooltip text={toolTip} size={16} />}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 mb-2
          text-gray-200 placeholder-gray-500"
      />

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-gray-700
        p-2 rounded bg-[#0f1117] custom-scrollbar
      ">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-white cursor-pointer
              hover:bg-[#2a2e3b] px-2 py-1 rounded"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="w-4 h-4 accent-[var(--primary-color)]"
              />
              {item.name}
            </label>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-2">No items found.</p>
        )}
      </div>
    </div>
  );
}