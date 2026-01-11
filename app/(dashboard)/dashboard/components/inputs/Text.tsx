"use client";

import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  tooltip,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-gray-400">{label}</label>

        {tooltip && <InfoTooltip text={tooltip} size={16} />}
      </div>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[#0d0f13] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${className}`}
      />
    </div>
  );
}
