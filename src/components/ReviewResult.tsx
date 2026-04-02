"use client";

import { ReviewResult as ReviewResultType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ReviewResultProps {
  result: ReviewResultType;
  originalText: string;
  onApply?: (revisedText: string) => void;
}

export function ReviewResultDisplay({ result, originalText, onApply }: ReviewResultProps) {
  const scoreVariant = result.score >= 4 ? "success" : result.score >= 3 ? "warning" : "danger";
  const scoreLabel = ["", "要改善", "もう少し", "まずまず", "良い", "非常に良い"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">総合スコア</h3>
            <p className="text-sm text-muted mt-1">{result.score_reason}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`w-3 h-8 rounded-sm transition-all ${
                    n <= result.score ? "bg-primary" : "bg-surface-light"
                  }`}
                />
              ))}
            </div>
            <Badge variant={scoreVariant} className="text-base px-3 py-1">
              {result.score}/5 {scoreLabel[result.score]}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Before/After */}
      <Card>
        <h3 className="text-lg font-bold mb-4">Before / After</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-danger mb-2">Before（原文）</h4>
            <div className="bg-surface rounded-lg p-4 text-sm leading-relaxed text-muted border border-danger/20">
              {originalText}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-success mb-2">After（添削後）</h4>
            <div className="bg-surface rounded-lg p-4 text-sm leading-relaxed text-foreground border border-success/20">
              {result.revised_text}
            </div>
          </div>
        </div>
      </Card>

      {/* Improvements */}
      <Card>
        <h3 className="text-lg font-bold mb-4">改善ポイント</h3>
        <div className="space-y-4">
          {result.improvements.map((imp, i) => (
            <div key={i} className="bg-surface/50 rounded-lg p-4">
              <Badge variant="primary" className="mb-2">{imp.category}</Badge>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div>
                  <p className="text-xs text-danger mb-1">修正前</p>
                  <p className="text-sm text-muted bg-danger/5 rounded p-2">{imp.before}</p>
                </div>
                <div>
                  <p className="text-xs text-success mb-1">修正後</p>
                  <p className="text-sm text-foreground bg-success/5 rounded p-2">{imp.after}</p>
                </div>
              </div>
              <p className="text-xs text-muted">{imp.reason}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths */}
      <Card>
        <h3 className="text-lg font-bold mb-3">原文の良い点</h3>
        <ul className="space-y-2">
          {result.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted">
              <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {s}
            </li>
          ))}
        </ul>
      </Card>

      {/* Tips */}
      <Card>
        <h3 className="text-lg font-bold mb-2">追加アドバイス</h3>
        <p className="text-sm text-muted leading-relaxed">{result.additional_tips}</p>
      </Card>

      {/* Apply button */}
      {onApply && (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => onApply(result.revised_text)}>
            この添削結果をガクチカに反映
          </Button>
        </div>
      )}
    </div>
  );
}
