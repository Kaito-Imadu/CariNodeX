"use client";

import { SelectionStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

const statusConfig: Record<SelectionStatus, { variant: "default" | "primary" | "success" | "warning" | "danger" | "info"; label: string }> = {
  "未応募": { variant: "default", label: "未応募" },
  "ES提出済": { variant: "info", label: "ES提出済" },
  "面接中": { variant: "warning", label: "面接中" },
  "内定": { variant: "success", label: "内定" },
  "辞退": { variant: "danger", label: "辞退" },
};

const allStatuses: SelectionStatus[] = ["未応募", "ES提出済", "面接中", "内定", "辞退"];

interface StatusBadgeProps {
  status: SelectionStatus;
  editable?: boolean;
  onChange?: (status: SelectionStatus) => void;
}

export function StatusBadge({ status, editable = false, onChange }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!editable) {
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  return (
    <div className="relative group">
      <Badge variant={config.variant} className="cursor-pointer">
        {config.label}
        <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Badge>
      <div className="absolute top-full right-0 mt-1 py-1 glass rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
        {allStatuses.map((s) => (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onChange?.(s); }}
            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-surface-hover transition-colors cursor-pointer ${
              s === status ? "text-primary" : "text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
