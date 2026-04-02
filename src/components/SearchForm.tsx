"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tag } from "@/components/ui/Tag";
import { CompanySize } from "@/types";

const suggestedKeywords = [
  "ロボット", "AI", "自動運転", "IoT", "画像認識",
  "制御工学", "DevOps", "SaaS", "機械学習", "フィジカルAI",
];

const companySizes: CompanySize[] = ["大企業", "メガベンチャー", "ベンチャー", "スタートアップ"];

interface SearchFormProps {
  onSearch: (keywords: string, sizes: CompanySize[]) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keywords, setKeywords] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<CompanySize[]>([]);

  const toggleSize = useCallback((size: CompanySize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  const addKeyword = useCallback((kw: string) => {
    setKeywords((prev) => {
      if (prev.includes(kw)) return prev;
      return prev ? `${prev}、${kw}` : kw;
    });
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keywords.trim() || selectedSizes.length === 0) return;
    onSearch(keywords.trim(), selectedSizes);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="興味キーワード"
        placeholder="ロボティクス、自動運転、フィジカルAI..."
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />

      <div className="space-y-2">
        <p className="text-sm text-muted">よく使うキーワード</p>
        <div className="flex flex-wrap gap-2">
          {suggestedKeywords.map((kw) => (
            <Tag
              key={kw}
              label={kw}
              selected={keywords.includes(kw)}
              onToggle={() => addKeyword(kw)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">企業規模</p>
        <div className="flex flex-wrap gap-2">
          {companySizes.map((size) => (
            <Tag
              key={size}
              label={size}
              selected={selectedSizes.includes(size)}
              onToggle={() => toggleSize(size)}
            />
          ))}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        isLoading={isLoading}
        disabled={!keywords.trim() || selectedSizes.length === 0}
      >
        {isLoading ? "検索中..." : "企業を検索"}
      </Button>
    </form>
  );
}
