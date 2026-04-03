"use client";

import { useState, useRef, useEffect } from "react";
import { SearchForm } from "@/components/SearchForm";
import { SearchResultCard } from "@/components/CompanyCard";
import { CompanyCardSkeleton } from "@/components/ui/Skeleton";
import { CompanySearchResult, CompanySize, SearchHistoryItem } from "@/types";
import {
  getCachedSearch,
  setCachedSearch,
  getLastSearchParams,
  setLastSearchParams,
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
} from "@/lib/storage";

export default function DiscoverPage() {
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialKeywords, setInitialKeywords] = useState("");
  const [initialSizes, setInitialSizes] = useState<CompanySize[]>([]);
  const [searchFormKey, setSearchFormKey] = useState(0);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const lastSearchRef = useRef<number>(0);
  const [restored, setRestored] = useState(false);

  // mount 時に前回の検索結果を復元 & 履歴を読み込み
  useEffect(() => {
    setHistory(getSearchHistory());
    const lastParams = getLastSearchParams();
    if (lastParams) {
      const cacheKey = `${lastParams.keywords}|${lastParams.sizes.sort().join(",")}`;
      const cached = getCachedSearch(cacheKey);
      if (cached) {
        setResults(cached);
        setHasSearched(true);
        setInitialKeywords(lastParams.keywords);
        setInitialSizes(lastParams.sizes);
        setSearchFormKey((k) => k + 1);
      }
    }
    setRestored(true);
  }, []);

  async function handleSearch(keywords: string, sizes: CompanySize[]) {
    const now = Date.now();
    if (now - lastSearchRef.current < 2000) return;
    lastSearchRef.current = now;

    const cacheKey = `${keywords}|${sizes.sort().join(",")}`;
    const cached = getCachedSearch(cacheKey);
    if (cached) {
      setResults(cached);
      setHasSearched(true);
      setError(null);
      setLastSearchParams({ keywords, sizes });
      addSearchHistory({ keywords, sizes, resultCount: cached.length });
      setHistory(getSearchHistory());
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
        setLastSearchParams({ keywords, sizes });
        addSearchHistory({ keywords, sizes, resultCount: data.companies.length });
        setHistory(getSearchHistory());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleHistoryClick(item: SearchHistoryItem) {
    setInitialKeywords(item.keywords);
    setInitialSizes(item.sizes);
    setSearchFormKey((k) => k + 1);
    handleSearch(item.keywords, item.sizes);
  }

  function handleHistoryDelete(id: string) {
    removeSearchHistory(id);
    setHistory(getSearchHistory());
  }

  if (!restored) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-primary">企業</span>を探す
        </h1>
        <p className="text-muted">興味キーワードと企業規模から、最適な企業を見つけましょう</p>
      </div>

      <div className="glass rounded-2xl p-6 mb-8">
        <SearchForm
          key={searchFormKey}
          onSearch={handleSearch}
          isLoading={isLoading}
          initialKeywords={initialKeywords}
          initialSizes={initialSizes}
        />
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
        <div className="animate-fade-in">
          {history.length > 0 ? (
            <div>
              <h2 className="text-lg font-bold mb-4">検索履歴</h2>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="glass rounded-xl p-4 flex items-center justify-between gap-3 hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.keywords}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted">
                          {item.sizes.join("・")}
                        </span>
                        <span className="text-xs text-muted">
                          {item.resultCount}社
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHistoryDelete(item.id);
                      }}
                      className="text-muted hover:text-danger transition-colors p-1 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
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
      )}
    </div>
  );
}
