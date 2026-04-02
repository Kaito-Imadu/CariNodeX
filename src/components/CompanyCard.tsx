"use client";

import Link from "next/link";
import { CompanySearchResult, SavedCompany, CompanySize } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/StatusBadge";
import { isCompanySaved, saveCompany, removeCompany } from "@/lib/storage";
import { useState, useEffect } from "react";

const sizeColors: Record<CompanySize, string> = {
  "大企業": "primary",
  "メガベンチャー": "info",
  "ベンチャー": "warning",
  "スタートアップ": "success",
};

interface SearchResultCardProps {
  company: CompanySearchResult;
  onSaveChange?: () => void;
  index?: number;
}

export function SearchResultCard({ company, onSaveChange, index = 0 }: SearchResultCardProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isCompanySaved(company.id));
  }, [company.id]);

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeCompany(company.id);
    } else {
      saveCompany({
        id: company.id,
        name: company.name,
        industry: company.industry,
        size: company.size,
        summary: company.summary,
      });
    }
    setSaved(!saved);
    onSaveChange?.();
  }

  return (
    <Link href={`/company/${company.id}?name=${encodeURIComponent(company.name)}`}>
      <Card hover className="stagger-item" style={{ animationDelay: `${index * 80}ms` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground truncate">{company.name}</h3>
              <Badge variant={company.match_level === "高" ? "success" : "warning"}>
                {company.match_level === "高" ? "高マッチ" : "中マッチ"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={sizeColors[company.size] as "primary" | "info" | "warning" | "success"}>
                {company.size}
              </Badge>
              <span className="text-sm text-muted">{company.industry}</span>
            </div>
            <p className="text-sm text-muted mt-2 line-clamp-2">{company.summary}</p>
            <p className="text-xs text-primary/80 mt-1.5">{company.match_reason}</p>
          </div>
          <button
            onClick={toggleSave}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-surface-hover transition-all duration-200 cursor-pointer group"
            title={saved ? "マイリストから削除" : "マイリストに追加"}
          >
            <svg
              className={`w-5 h-5 transition-all duration-200 ${
                saved ? "text-danger fill-danger" : "text-muted group-hover:text-danger"
              }`}
              viewBox="0 0 24 24"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </Card>
    </Link>
  );
}

interface SavedCompanyCardProps {
  company: SavedCompany;
  onStatusChange: (id: string, status: SavedCompany["status"]) => void;
  onRemove: (id: string) => void;
}

export function SavedCompanyCard({ company, onStatusChange, onRemove }: SavedCompanyCardProps) {
  const isDeadlineSoon = company.deadline && new Date(company.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && new Date(company.deadline) > new Date();

  return (
    <Link href={`/company/${company.id}?name=${encodeURIComponent(company.name)}`}>
      <Card hover>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground truncate">{company.name}</h3>
              <StatusBadge
                status={company.status}
                editable
                onChange={(s) => onStatusChange(company.id, s)}
              />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={sizeColors[company.size] as "primary" | "info" | "warning" | "success"}>
                {company.size}
              </Badge>
              <span className="text-sm text-muted">{company.industry}</span>
            </div>
            <p className="text-sm text-muted mt-2 line-clamp-2">{company.summary}</p>
            {company.deadline && (
              <p className={`text-xs mt-1.5 ${isDeadlineSoon ? "text-danger font-medium" : "text-muted"}`}>
                {isDeadlineSoon && "!! "}締切: {new Date(company.deadline).toLocaleDateString("ja-JP")}
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(company.id); }}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer text-muted hover:text-danger"
            title="削除"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </Card>
    </Link>
  );
}
