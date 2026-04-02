"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CompanyDetail } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { isCompanySaved, saveCompany, removeCompany, updateCompany, getSavedCompanies } from "@/lib/storage";
import Link from "next/link";

export default function CompanyDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
      </div>
    }>
      <CompanyDetailContent />
    </Suspense>
  );
}

function CompanyDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const companyName = searchParams.get("name") || "";

  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    setSaved(isCompanySaved(id));
    const savedCompanies = getSavedCompanies();
    const sc = savedCompanies.find((c) => c.id === id);
    if (sc) setMemo(sc.memo);
  }, [id]);

  useEffect(() => {
    if (!companyName) return;
    setIsLoading(true);
    fetch(`/api/company/${id}?name=${encodeURIComponent(companyName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("企業情報の取得に失敗しました");
        return res.json();
      })
      .then((data) => setDetail(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id, companyName]);

  function toggleSave() {
    if (saved) {
      removeCompany(id);
    } else {
      saveCompany({
        id,
        name: companyName,
        industry: detail?.overview?.description?.split("。")[0] || "",
        size: "大企業",
        summary: detail?.overview?.description?.substring(0, 100) || "",
      });
    }
    setSaved(!saved);
  }

  function handleMemoSave() {
    updateCompany(id, { memo });
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-danger text-lg">{error || "企業情報を取得できませんでした"}</p>
        <Link href="/discover">
          <Button variant="outline" className="mt-4">検索に戻る</Button>
        </Link>
      </div>
    );
  }

  const d = detail;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{d.overview.official_name}</h1>
          <div className="flex items-center gap-3 mt-2 text-muted text-sm">
            <span>{d.overview.headquarters}</span>
            <span>設立 {d.overview.founded}</span>
            <span>{d.overview.employees}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={toggleSave} variant={saved ? "danger" : "primary"}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {saved ? "リストから削除" : "マイリストに追加"}
          </Button>
          <Link href={`/review?company=${encodeURIComponent(companyName)}`}>
            <Button variant="outline">ES添削</Button>
          </Link>
        </div>
      </div>

      {/* Overview */}
      <Card>
        <SectionTitle>企業概要</SectionTitle>
        <p className="text-muted leading-relaxed">{d.overview.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <InfoItem label="売上規模" value={d.overview.revenue} />
          <InfoItem label="従業員数" value={d.overview.employees} />
          <InfoItem label="設立" value={d.overview.founded} />
          <InfoItem label="本社" value={d.overview.headquarters} />
        </div>
      </Card>

      {/* Technology */}
      <Card>
        <SectionTitle>技術・プロダクト</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-4">
          {d.technology.tech_stack.map((tech) => (
            <Badge key={tech} variant="primary">{tech}</Badge>
          ))}
        </div>
        <div className="space-y-3">
          {d.technology.products.map((p) => (
            <div key={p.name} className="bg-surface/50 rounded-lg p-3">
              <h4 className="font-medium text-foreground">{p.name}</h4>
              <p className="text-sm text-muted mt-1">{p.description}</p>
            </div>
          ))}
        </div>
        {(d.technology.tech_blog_url || d.technology.github_url) && (
          <div className="flex gap-3 mt-4">
            {d.technology.tech_blog_url && (
              <a href={d.technology.tech_blog_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                Tech Blog
              </a>
            )}
            {d.technology.github_url && (
              <a href={d.technology.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                GitHub
              </a>
            )}
          </div>
        )}
      </Card>

      {/* Recruitment */}
      <Card>
        <SectionTitle>新卒採用情報</SectionTitle>
        <div className="space-y-3 mb-4">
          {d.recruitment.positions.map((p) => (
            <div key={p.title} className="bg-surface/50 rounded-lg p-3">
              <h4 className="font-medium text-foreground">{p.title}</h4>
              <p className="text-sm text-muted mt-1">{p.description}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoItem label="インターン時期" value={d.recruitment.intern_period} />
          <InfoItem label="選考フロー" value={d.recruitment.selection_flow} />
          <InfoItem label="採用人数" value={d.recruitment.hiring_count} />
        </div>
      </Card>

      {/* Compensation */}
      <Card>
        <SectionTitle>待遇・働き方</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="修士卒初任給" value={d.compensation.starting_salary_master} />
          <InfoItem label="平均年収（推定）" value={d.compensation.average_salary} />
          <InfoItem label="勤務地" value={d.compensation.work_locations.join("、")} />
          <InfoItem label="リモートワーク" value={d.compensation.remote_policy} />
        </div>
        <div className="mt-4">
          <InfoItem label="福利厚生" value={d.compensation.benefits_highlights} />
        </div>
      </Card>

      {/* Selection Tips */}
      <Card>
        <SectionTitle>選考対策ヒント</SectionTitle>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">求める人材像</h4>
            <p className="text-muted text-sm leading-relaxed">{d.selection_tips.ideal_candidate}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-primary mb-2">よく聞かれる質問</h4>
            <ul className="space-y-2">
              {d.selection_tips.common_questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-primary font-mono text-xs mt-0.5">Q{i + 1}</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-primary mb-1">ES・ガクチカのアドバイス</h4>
            <p className="text-muted text-sm leading-relaxed">{d.selection_tips.essay_advice}</p>
          </div>
        </div>
      </Card>

      {/* External Links */}
      <Card>
        <SectionTitle>外部リンク</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {d.links.career_page && (
            <a href={d.links.career_page} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">公式採用ページ</Button>
            </a>
          )}
          <a href={d.links.openwork_search} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">OpenWork で検索</Button>
          </a>
          <a href={d.links.onecareer_search} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">OneCareer で検索</Button>
          </a>
        </div>
      </Card>

      {/* Memo */}
      {saved && (
        <Card>
          <SectionTitle>選考メモ</SectionTitle>
          <Textarea
            placeholder="この企業についてのメモを自由に記入..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="mb-3"
          />
          <Button variant="outline" size="sm" onClick={handleMemoSave}>
            メモを保存
          </Button>
        </Card>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
      <span className="w-1 h-5 bg-primary rounded-full" />
      {children}
    </h3>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
