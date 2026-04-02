"use client";

import { useState, useEffect, useMemo } from "react";
import { UserProfile, Gakuchika } from "@/types";
import { getProfile, saveProfile } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GakuchikaCard } from "@/components/GakuchikaCard";
import { GakuchikaForm } from "@/components/GakuchikaForm";

const skillSuggestions = [
  "Python", "C++", "TypeScript", "ROS2", "Docker", "Kubernetes",
  "PyTorch", "TensorFlow", "React", "Next.js", "Go", "Rust",
  "CI/CD", "YOLO", "OpenCV", "SLAM", "Git",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingGakuchika, setEditingGakuchika] = useState<Gakuchika | null>(null);
  const [showGakuchikaForm, setShowGakuchikaForm] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newQualification, setNewQualification] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "gakuchika" | "skills">("basic");

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  function save(updates: Partial<UserProfile>) {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    saveProfile(updated);
  }

  const completeness = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    const total = 8;
    if (profile.university) score++;
    if (profile.major) score++;
    if (profile.researchTheme) score++;
    if (profile.careerAxis) score++;
    if (profile.selfPR) score++;
    if (profile.skills.length > 0) score++;
    if (profile.gakuchika.length > 0) score++;
    if (profile.qualifications.length > 0) score++;
    return Math.round((score / total) * 100);
  }, [profile]);

  if (!profile) return null;

  function addGakuchika(g: Omit<Gakuchika, "id" | "order">) {
    const newG: Gakuchika = {
      ...g,
      id: crypto.randomUUID(),
      order: profile!.gakuchika.length,
    };
    save({ gakuchika: [...profile!.gakuchika, newG] });
    setShowGakuchikaForm(false);
  }

  function updateGakuchika(g: Omit<Gakuchika, "id" | "order">) {
    if (!editingGakuchika) return;
    save({
      gakuchika: profile!.gakuchika.map((item) =>
        item.id === editingGakuchika.id ? { ...item, ...g } : item
      ),
    });
    setEditingGakuchika(null);
  }

  function deleteGakuchika(id: string) {
    save({ gakuchika: profile!.gakuchika.filter((g) => g.id !== id) });
  }

  function addSkill(skill: string) {
    if (!skill.trim() || profile!.skills.includes(skill.trim())) return;
    save({ skills: [...profile!.skills, skill.trim()] });
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    save({ skills: profile!.skills.filter((s) => s !== skill) });
  }

  function addQualification() {
    if (!newQualification.trim() || profile!.qualifications.includes(newQualification.trim())) return;
    save({ qualifications: [...profile!.qualifications, newQualification.trim()] });
    setNewQualification("");
  }

  function removeQualification(q: string) {
    save({ qualifications: profile!.qualifications.filter((item) => item !== q) });
  }

  const tabs = [
    { key: "basic" as const, label: "基本情報" },
    { key: "gakuchika" as const, label: "ガクチカ" },
    { key: "skills" as const, label: "スキル・資格" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        <span className="text-primary">マイ</span>プロフィール
      </h1>
      <p className="text-muted text-sm mb-6">登録した情報はES添削で活用されます</p>

      <ProgressBar value={completeness} label="プロフィール完成度" className="mb-8" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 glass rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === "basic" && (
        <div className="space-y-4">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="氏名（任意）" placeholder="山田太郎" value={profile.name} onChange={(e) => save({ name: e.target.value })} />
              <Input label="大学・研究科" placeholder="東京大学 工学系研究科" value={profile.university} onChange={(e) => save({ university: e.target.value })} />
              <Input label="専攻分野" placeholder="機械工学" value={profile.major} onChange={(e) => save({ major: e.target.value })} />
              <Input label="志望軸" placeholder="例: 効率化と挑戦" value={profile.careerAxis} onChange={(e) => save({ careerAxis: e.target.value })} />
            </div>
            <div className="mt-4">
              <Textarea
                label="研究テーマ"
                placeholder="研究テーマを簡潔に記述してください（200字程度）"
                value={profile.researchTheme}
                onChange={(e) => save({ researchTheme: e.target.value })}
                rows={3}
              />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-foreground mb-3">自己PR（任意）</h3>
            <Textarea
              placeholder="自己PRを記述してください（400字程度）"
              value={profile.selfPR}
              onChange={(e) => save({ selfPR: e.target.value })}
              rows={6}
            />
            <p className="text-xs text-muted text-right mt-1">{profile.selfPR.length}文字</p>
          </Card>
        </div>
      )}

      {/* Gakuchika */}
      {activeTab === "gakuchika" && (
        <div className="space-y-4">
          {(showGakuchikaForm || editingGakuchika) ? (
            <Card>
              <h3 className="font-bold text-foreground mb-4">
                {editingGakuchika ? "ガクチカを編集" : "ガクチカを追加"}
              </h3>
              <GakuchikaForm
                initial={editingGakuchika || undefined}
                onSave={editingGakuchika ? updateGakuchika : addGakuchika}
                onCancel={() => { setShowGakuchikaForm(false); setEditingGakuchika(null); }}
              />
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{profile.gakuchika.length}件 登録済み</p>
                <Button size="sm" onClick={() => setShowGakuchikaForm(true)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  追加
                </Button>
              </div>
              {profile.gakuchika.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted">ガクチカがまだ登録されていません</p>
                  <p className="text-sm text-muted mt-1">「追加」ボタンから登録しましょう</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.gakuchika.map((g) => (
                    <GakuchikaCard
                      key={g.id}
                      gakuchika={g}
                      onEdit={() => setEditingGakuchika(g)}
                      onDelete={() => deleteGakuchika(g.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Skills */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-foreground mb-3">スキル</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.map((skill) => (
                <Tag key={skill} label={skill} removable onRemove={() => removeSkill(skill)} selected />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <p className="text-xs text-muted w-full mb-1">よく使うスキル（クリックで追加）</p>
              {skillSuggestions.filter((s) => !profile.skills.includes(s)).map((skill) => (
                <Tag key={skill} label={skill} onToggle={() => addSkill(skill)} />
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="その他のスキルを入力..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(newSkill); } }}
              />
              <Button variant="outline" onClick={() => addSkill(newSkill)}>追加</Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-foreground mb-3">資格</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.qualifications.map((q) => (
                <Tag key={q} label={q} removable onRemove={() => removeQualification(q)} selected />
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="例: TOEIC 700、基本情報技術者"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQualification(); } }}
              />
              <Button variant="outline" onClick={addQualification}>追加</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
