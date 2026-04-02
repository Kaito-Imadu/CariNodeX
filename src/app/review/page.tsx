"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewCriteria, ReviewResult, Gakuchika, SavedCompany } from "@/types";
import { getProfile, getSavedCompanies, saveProfile, addReviewHistory, getReviewHistory } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tag } from "@/components/ui/Tag";
import { GakuchikaCard } from "@/components/GakuchikaCard";
import { ReviewResultDisplay } from "@/components/ReviewResult";
import { Badge } from "@/components/ui/Badge";

const allCriteria: ReviewCriteria[] = [
  "企業の求める人材像へのフィット度",
  "論理構造・STAR法の改善",
  "具体性・数字の追加提案",
  "文章の読みやすさ・簡潔さ",
  "差別化ポイントの強調",
];

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8"><p className="text-muted">読み込み中...</p></div>}>
      <ReviewPageContent />
    </Suspense>
  );
}

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const preselectedCompany = searchParams.get("company") || "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [gakuchikaList, setGakuchikaList] = useState<Gakuchika[]>([]);
  const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>([]);
  const [selectedGakuchika, setSelectedGakuchika] = useState<Gakuchika | null>(null);
  const [freeText, setFreeText] = useState("");
  const [useCustomText, setUseCustomText] = useState(false);
  const [companyName, setCompanyName] = useState(preselectedCompany);
  const [criteria, setCriteria] = useState<ReviewCriteria[]>(allCriteria.slice(0, 3));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    setGakuchikaList(profile.gakuchika);
    setSavedCompanies(getSavedCompanies());
  }, []);

  function toggleCriteria(c: ReviewCriteria) {
    setCriteria((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  const originalText = useCustomText ? freeText : (selectedGakuchika?.content || "");

  async function handleReview() {
    if (!originalText.trim() || !companyName.trim() || criteria.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const profile = getProfile();
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText,
          companyName,
          companyInfo: "",
          criteria,
          profile: {
            major: profile.major,
            researchTheme: profile.researchTheme,
            careerAxis: profile.careerAxis,
            skills: profile.skills,
          },
        }),
      });

      if (!res.ok) throw new Error("添削に失敗しました");
      const data: ReviewResult = await res.json();
      setResult(data);
      setStep(4);

      addReviewHistory({
        id: crypto.randomUUID(),
        gakuchikaTitle: selectedGakuchika?.title || "自由記述",
        companyName,
        originalText,
        result: data,
        criteria,
        reviewedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  function handleApply(revisedText: string) {
    if (!selectedGakuchika) return;
    const profile = getProfile();
    const updated = profile.gakuchika.map((g) =>
      g.id === selectedGakuchika.id ? { ...g, content: revisedText } : g
    );
    saveProfile({ ...profile, gakuchika: updated });
    setGakuchikaList(updated);
    alert("ガクチカを更新しました！");
  }

  const history = getReviewHistory();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="text-primary">ES</span>添削
          </h1>
          <p className="text-muted text-sm mt-1">AIが企業に合わせてガクチカを添削します</p>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
            履歴 ({history.length})
          </Button>
        )}
      </div>

      {/* History */}
      {showHistory && (
        <Card className="mb-6">
          <h3 className="font-bold mb-3">添削履歴</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setResult(h.result);
                  setCompanyName(h.companyName);
                  setStep(4);
                  setShowHistory(false);
                  if (!useCustomText) setFreeText(h.originalText);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{h.gakuchikaTitle}</span>
                  <Badge variant="primary">{h.companyName}</Badge>
                </div>
                <p className="text-xs text-muted mt-1">
                  {new Date(h.reviewedAt).toLocaleDateString("ja-JP")} | スコア: {h.result.score}/5
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Steps indicator */}
      {step < 4 && (
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s === step ? "bg-primary text-white" : s < step ? "bg-primary/20 text-primary" : "bg-surface-light text-muted"
                }`}
              >
                {s < step ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-primary" : "bg-surface-light"}`} />}
            </div>
          ))}
          <span className="text-sm text-muted ml-2">
            {step === 1 && "対象を選ぶ"}
            {step === 2 && "企業を選ぶ"}
            {step === 3 && "観点を選ぶ"}
          </span>
        </div>
      )}

      {/* Step 1: Select gakuchika */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={!useCustomText ? "primary" : "ghost"}
              size="sm"
              onClick={() => setUseCustomText(false)}
            >
              登録済みから選択
            </Button>
            <Button
              variant={useCustomText ? "primary" : "ghost"}
              size="sm"
              onClick={() => setUseCustomText(true)}
            >
              自由記述
            </Button>
          </div>

          {useCustomText ? (
            <Card>
              <Textarea
                label="ES文を入力"
                placeholder="添削したい文章を入力してください..."
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                rows={8}
              />
              <p className="text-xs text-muted text-right mt-1">{freeText.length}文字</p>
              <div className="mt-4">
                <Button onClick={() => setStep(2)} disabled={!freeText.trim()}>
                  次へ
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {gakuchikaList.length === 0 ? (
                <Card>
                  <p className="text-muted text-center py-8">
                    ガクチカが登録されていません。
                    <a href="/profile" className="text-primary hover:underline ml-1">プロフィール</a>
                    から登録するか、自由記述をお使いください。
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {gakuchikaList.map((g) => (
                    <GakuchikaCard
                      key={g.id}
                      gakuchika={g}
                      selectable
                      selected={selectedGakuchika?.id === g.id}
                      onSelect={() => {
                        setSelectedGakuchika(g);
                        setStep(2);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Step 2: Select company */}
      {step === 2 && (
        <div className="space-y-4">
          {savedCompanies.length > 0 && (
            <Card>
              <h3 className="font-bold mb-3">マイリストから選択</h3>
              <div className="flex flex-wrap gap-2">
                {savedCompanies.map((c) => (
                  <Tag
                    key={c.id}
                    label={c.name}
                    selected={companyName === c.name}
                    onToggle={() => setCompanyName(c.name)}
                  />
                ))}
              </div>
            </Card>
          )}
          <Card>
            <Input
              label="企業名を入力"
              placeholder="例: トヨタ自動車"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </Card>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>戻る</Button>
            <Button onClick={() => setStep(3)} disabled={!companyName.trim()}>次へ</Button>
          </div>
        </div>
      )}

      {/* Step 3: Select criteria */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold mb-3">添削の観点を選択</h3>
            <div className="space-y-2">
              {allCriteria.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCriteria(c)}
                  className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${
                    criteria.includes(c) ? "bg-primary/10 border border-primary/40" : "bg-surface hover:bg-surface-hover border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      criteria.includes(c) ? "border-primary bg-primary" : "border-border"
                    }`}>
                      {criteria.includes(c) && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{c}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)}>戻る</Button>
            <Button onClick={handleReview} disabled={criteria.length === 0} isLoading={isLoading}>
              {isLoading ? "添削中..." : "添削する"}
            </Button>
          </div>

          {error && (
            <div className="glass rounded-xl p-4 border-danger/30 border">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && result && (
        <div>
          <div className="flex gap-3 mb-6">
            <Button variant="ghost" onClick={() => { setResult(null); setStep(1); }}>
              新しい添削
            </Button>
            <Button variant="outline" onClick={() => { setStep(2); setResult(null); }}>
              別の企業で添削
            </Button>
          </div>
          <ReviewResultDisplay
            result={result}
            originalText={originalText}
            onApply={selectedGakuchika ? handleApply : undefined}
          />
        </div>
      )}
    </div>
  );
}
