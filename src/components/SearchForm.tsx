"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tag } from "@/components/ui/Tag";
import { CompanySize } from "@/types";

const keywordCategories: { name: string; keywords: string[] }[] = [
  {
    name: "AI・機械学習",
    keywords: ["AI", "機械学習", "深層学習", "自然言語処理", "画像認識", "音声認識", "生成AI", "LLM", "強化学習", "データサイエンス", "レコメンド"],
  },
  {
    name: "ロボティクス・制御",
    keywords: ["ロボット", "自動運転", "ドローン", "制御工学", "フィジカルAI", "SLAM", "ROS", "マニピュレータ", "自律移動", "センサフュージョン"],
  },
  {
    name: "Web・アプリ開発",
    keywords: ["Web開発", "フロントエンド", "バックエンド", "モバイルアプリ", "SaaS", "フルスタック", "API開発", "マイクロサービス", "UI/UX"],
  },
  {
    name: "インフラ・クラウド",
    keywords: ["クラウド", "AWS", "GCP", "Azure", "DevOps", "SRE", "Kubernetes", "CI/CD", "セキュリティ", "ネットワーク"],
  },
  {
    name: "ハードウェア・組込み",
    keywords: ["IoT", "組込みシステム", "FPGA", "半導体", "電子回路", "ファームウェア", "エッジコンピューティング", "センサ"],
  },
  {
    name: "業界・領域",
    keywords: ["モビリティ", "ヘルスケア", "医療", "FinTech", "EdTech", "ゲーム", "EC", "物流", "エネルギー", "宇宙", "農業", "建設DX", "メディア", "広告", "製造業DX"],
  },
  {
    name: "研究・先端技術",
    keywords: ["コンピュータビジョン", "量子コンピュータ", "ブロックチェーン", "XR/メタバース", "3Dモデリング", "シミュレーション", "デジタルツイン", "バイオインフォマティクス"],
  },
  {
    name: "データ・分析",
    keywords: ["ビッグデータ", "データ基盤", "ETL", "BI", "統計分析", "A/Bテスト", "MLOps", "データエンジニアリング"],
  },
];

const companySizes: CompanySize[] = ["大企業", "メガベンチャー", "ベンチャー", "スタートアップ"];

interface SearchFormProps {
  onSearch: (keywords: string, sizes: CompanySize[]) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keywords, setKeywords] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<CompanySize[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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

  const toggleCategory = useCallback((name: string) => {
    setExpandedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
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
        <p className="text-sm text-muted">キーワードを選択（カテゴリをクリックで展開）</p>
        <div className="space-y-1.5">
          {keywordCategories.map((cat) => {
            const isExpanded = expandedCategories.includes(cat.name);
            return (
              <div key={cat.name} className="rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <span>{cat.name}</span>
                  <svg
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-2.5 flex flex-wrap gap-1.5 animate-fade-in">
                    {cat.keywords.map((kw) => (
                      <Tag
                        key={kw}
                        label={kw}
                        selected={keywords.includes(kw)}
                        onToggle={() => addKeyword(kw)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
