"use client";

import { useState, useRef } from "react";
import { SearchForm } from "@/components/SearchForm";
import { SearchResultCard } from "@/components/CompanyCard";
import { CompanyCardSkeleton } from "@/components/ui/Skeleton";
import { CompanySearchResult, CompanySize } from "@/types";
import { getCachedSearch, setCachedSearch } from "@/lib/storage";

export default function DiscoverPage() {
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const lastSearchRef = useRef<number>(0);

  async function handleSearch(keywords: string, sizes: CompanySize[]) {
    // Debounce: prevent rapid fire
    const now = Date.now();
    if (now - lastSearchRef.current < 2000) return;
    lastSearchRef.current = now;

    const cacheKey = `${keywords}|${sizes.sort().join(",")}`;
    const cached = getCachedSearch(cacheKey);
    if (cached) {
      setResults(cached);
      setHasSearched(true);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, sizes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "検索に失敗しました");
      }

      const data = await res.json();
      setResults(data.companies || []);
      if (data.companies?.length) {
        setCachedSearch(cacheKey, data.companies);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-primary">企業</span>を探す
        </h1>
        <p className="text-muted">興味キーワードと企業規模から、最適な企業を見つけましょう</p>
      </div>

      <div className="glass rounded-2xl p-6 mb-8">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border-danger/30 border mb-6 animate-fade-in">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-4">{results.length}社 見つかりました</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((company, i) => (
              <SearchResultCard key={company.id} company={company} index={i} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && !error && (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-muted text-lg">該当する企業が見つかりませんでした</p>
          <p className="text-muted text-sm mt-2">キーワードや企業規模を変えて再検索してみてください</p>
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="text-foreground text-lg font-medium">キーワードを入力して検索</p>
          <p className="text-muted text-sm mt-2">AIがあなたの興味に合った企業を10社レコメンドします</p>
        </div>
      )}
    </div>
  );
}
