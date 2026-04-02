"use client";

import { useState } from "react";
import { Gakuchika, GakuchikaCategory } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tag } from "@/components/ui/Tag";

const categories: GakuchikaCategory[] = [
  "部活・サークル", "インターン・アルバイト", "研究", "留学", "個人開発", "資格・語学", "その他",
];

const suggestedTags = [
  "リーダーシップ", "継続力", "技術力", "課題解決", "チームワーク",
  "コミュニケーション", "分析力", "創造性", "忍耐力", "主体性",
];

interface GakuchikaFormProps {
  initial?: Gakuchika;
  onSave: (g: Omit<Gakuchika, "id" | "order">) => void;
  onCancel: () => void;
}

export function GakuchikaForm({ initial, onSave, onCancel }: GakuchikaFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState<GakuchikaCategory>(initial?.category || "その他");
  const [content, setContent] = useState(initial?.content || "");
  const [tags, setTags] = useState<string[]>(initial?.tags || []);

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), category, content: content.trim(), tags });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="タイトル" placeholder="例: 体操競技15年" value={title} onChange={(e) => setTitle(e.target.value)} />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">カテゴリ</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Tag key={c} label={c} selected={category === c} onToggle={() => setCategory(c)} />
          ))}
        </div>
      </div>

      <Textarea
        label="本文（400〜800字推奨）"
        placeholder="学生時代に力を入れたことを記述してください..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
      />
      <p className="text-xs text-muted text-right">{content.length}文字</p>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">タグ</label>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map((tag) => (
            <Tag key={tag} label={tag} selected={tags.includes(tag)} onToggle={() => toggleTag(tag)} />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={!title.trim() || !content.trim()}>
          {initial ? "更新する" : "追加する"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
