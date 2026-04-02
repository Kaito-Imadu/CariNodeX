"use client";

interface TagProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function Tag({ label, selected = false, onToggle, removable, onRemove }: TagProps) {
  return (
    <button
      type="button"
      onClick={onToggle || onRemove}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
        selected
          ? "bg-primary/20 text-primary border border-primary/40"
          : "bg-surface-light text-muted border border-transparent hover:border-border hover:text-foreground"
      }`}
    >
      {label}
      {removable && (
        <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </button>
  );
}
