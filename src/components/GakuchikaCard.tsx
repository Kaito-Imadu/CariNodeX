"use client";

import { Gakuchika } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface GakuchikaCardProps {
  gakuchika: Gakuchika;
  onEdit?: () => void;
  onDelete?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function GakuchikaCard({ gakuchika, onEdit, onDelete, selectable, selected, onSelect }: GakuchikaCardProps) {
  return (
    <Card
      hover={selectable}
      className={`relative ${selectable ? "cursor-pointer" : ""} ${
        selected ? "!border-primary/60 bg-primary/5" : ""
      }`}
      onClick={selectable ? onSelect : undefined}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-bold text-foreground">{gakuchika.title}</h4>
        <Badge variant="info">{gakuchika.category}</Badge>
      </div>
      <p className="text-sm text-muted line-clamp-3 leading-relaxed">{gakuchika.content}</p>
      {gakuchika.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {gakuchika.tags.map((tag) => (
            <Badge key={tag} variant="default">{tag}</Badge>
          ))}
        </div>
      )}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          {onEdit && (
            <button onClick={onEdit} className="text-sm text-primary hover:underline cursor-pointer">
              編集
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-sm text-danger hover:underline cursor-pointer">
              削除
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
