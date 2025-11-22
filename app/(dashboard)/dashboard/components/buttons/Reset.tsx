import { Undo } from "lucide-react";

interface ResetButtonProps {
  onClick?: () => void;
  loading?: boolean;
}

export default function ResetButon({ onClick, loading = false }: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`
          flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-color)] hover:bg-[var(--hover-color)]
          text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        `}
    >
      <Undo size={18}  />
      Reset
    </button>
  );
}