"use client";

import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";
import React, { useState } from "react";

interface Role {
  id: string;
  name: string;
}

interface Props {
  label: string;
  toolTip?: string;
  roles: Role[];
  selectedRoles: string[];
  onToggle: (roleId: string) => void;
}

export default function RolesInput({
  label,
  toolTip,
  roles,
  selectedRoles,
  onToggle,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase()),
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
        placeholder="Search roles..."
        className="w-full bg-[#0f1117] border border-gray-700 rounded p-2 mb-2
          text-gray-200 placeholder-gray-500"
      />

      {/* Role list */}
      <div
        className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-gray-700 
        p-2 rounded bg-[#0f1117] custom-scrollbar
      "
      >
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
            <label
              key={role.id}
              className="flex items-center gap-2 text-white cursor-pointer 
              hover:bg-[#2a2e3b] px-2 py-1 rounded"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.id)}
                onChange={() => onToggle(role.id)}
                className="w-4 h-4 accent-[var(--primary-color)]"
              />
              {role.name}
            </label>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-2">
            No roles found.
          </p>
        )}
      </div>
    </div>
  );
}
