"use client";

import React, { useEffect, useState } from "react";

interface ToggleSwitchProps {
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  className?: string;
  label?: string | React.ReactNode;
}

export default function ToggleSwitch({
  enabled: controlledEnabled,
  onChange,
  className = "",
  label,
}: ToggleSwitchProps) {
  const [internalEnabled, setInternalEnabled] = useState(controlledEnabled ?? false);

  useEffect(() => {
    if (controlledEnabled !== undefined) {
      setInternalEnabled(controlledEnabled);
    }
  }, [controlledEnabled]);

  const toggle = () => {
    const newValue = !internalEnabled;
    setInternalEnabled(newValue);
    onChange?.(newValue);
  };

  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <button
        type="button"
        onClick={toggle}
        className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
          internalEnabled ? "bg-[var(--primary-color)]" : "bg-gray-700"
        }`}
        aria-pressed={internalEnabled}
        aria-label={typeof label === 'string' ? label : 'Toggle switch'}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
            internalEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label && <span className="ml-2 select-none">{label}</span>}
    </label>
  );
}