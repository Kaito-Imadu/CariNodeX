"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SavedCompany, SelectionStatus, CompanySize } from "@/types";
import { getSavedCompanies, updateCompany, removeCompany } from "@/lib/storage";
import { SavedCompanyCard } from "@/components/CompanyCard";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

type SortKey = "savedAt" | "deadline" | "name";

export default function HomePage() {
  const [companies, setCompanies] = useState<SavedCompany[]>([]);
  const [filterStatus, setFilterStatus] = useState<SelectionStatus | "all">("all");
  const [filterSize, setFilterSize] = useState<CompanySize | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("savedAt");

  useEffect(() => {
    setCompanies(getSavedCompanies());
  }, []);

  function refresh() {
    setCompanies(getSavedCompanies());
  }

  function handleStatusChange(id: string, status: SelectionStatus) {
    updateCompany(id, { status });
    refresh();
  }

  function handleRemove(id: string) {
    removeCompany(id);
    refresh();
  }

  const filtered = useMemo(() => {
    let result = [...companies];
    if (filterStatus !== "all") result = result.filter((c) => c.status === filterStatus);
    if (filterSize !== "all") result = result.filter((c) => c.size === filterSize);

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name, "ja");
      if (sortBy === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
    return result;
  }, [companies, filterStatus, filterSize, sortBy]);

  const statuses: (SelectionStatus | "all")[] = ["all", "未応募", "ES提出済", "面接中", "内定", "辞退"];
  const sizes: (CompanySize | "all")[] = ["all", "大企業", "メガベンチャー", "ベンチャー", "スタートアップ"];
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "savedAt", label: "登録日" },
    { key: "deadline", label: "締切日" },
    { key: "name", label: "企業名" },
  ];

  if (companies.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-primary">Cari</span>NodeX
        </h1>
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
              <line x1="12" y1="2" x2="12" y2="6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">まずは企業を探してみよう!</h2>
          <p className="text-muted text-center mb-6 max-w-md">
            興味キーワードと企業規模を選んで、AIがあなたにぴったりの企業を10社レコメンドします
          </p>
          <Link href="/discover">
            <Button size="lg">企業を検索する</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="text-primary">マイ</span>リスト
          </h1>
          <p className="text-sm text-muted mt-1">{companies.length}社 登録中</p>
        </div>
        <Link href="/discover">
          <Button variant="outline" size="sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            企業を追加
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted mr-1">ステータス:</span>
          {statuses.map((s) => (
            <Tag
              key={s}
              label={s === "all" ? "すべて" : s}
              selected={filterStatus === s}
              onToggle={() => setFilterStatus(s)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted mr-1">企業規模:</span>
          {sizes.map((s) => (
            <Tag
              key={s}
              label={s === "all" ? "すべて" : s}
              selected={filterSize === s}
              onToggle={() => setFilterSize(s)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted mr-1">ソート:</span>
          {sortOptions.map((opt) => (
            <Tag
              key={opt.key}
              label={opt.label}
              selected={sortBy === opt.key}
              onToggle={() => setSortBy(opt.key)}
            />
          ))}
        </div>
      </div>

      {/* Company list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">条件に一致する企業がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((company) => (
            <SavedCompanyCard
              key={company.id}
              company={company}
              onStatusChange={handleStatusChange}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
