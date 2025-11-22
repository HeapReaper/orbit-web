"use client";

import InfoTooltip from "@/app/(dashboard)/dashboard/components/ui/InfoToolTip";


interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  tooltip?: string;
}

export default function NumberInput({ label, value, onChange, min, max, step, placeholder, tooltip }: NumberInputProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-gray-400">{label}</label>

        {tooltip && (
          <InfoTooltip text={tooltip} size={16} />
        )}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="w-full bg-[#0d0f13] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
      />
    </div>
  );
}
