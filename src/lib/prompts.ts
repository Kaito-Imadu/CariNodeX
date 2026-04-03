import { ReviewCriteria, CompanyDetail } from "@/types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function buildChatPrompt(
  companyName: string,
  companyDetail: CompanyDetail,
  history: ChatMessage[],
  question: string
): string {
  const contextJson = JSON.stringify(companyDetail, null, 2);
  const historyText = history
    .map((m) => `${m.role === "user" ? "ユーザー" : "アシスタント"}: ${m.content}`)
    .join("\n");

  return `あなたは「${companyName}」について詳しいキャリアアドバイザーです。
就活生からの質問に、以下の企業情報をもとに日本語で簡潔に回答してください。

【企業情報】
${contextJson}

${historyText ? `【会話履歴】\n${historyText}\n` : ""}
【質問】
${question}

【注意事項】
- 企業情報に含まれない内容については「確認できませんでした」と正直に答えてください
- 回答は簡潔に（3〜5文程度）、就活生にとって実用的な内容にしてください
- JSON形式ではなく、普通のテキストで回答してください`;
}

export function buildSearchPrompt(keywords: string, sizes: string[]): string {
  return `あなたは日本の就活に詳しいキャリアアドバイザーです。

以下の条件に合う日本企業を10社レコメンドしてください。

【条件】
- 興味キーワード: ${keywords}
- 企業規模: ${sizes.join(", ")}
- 対象: 新卒採用（技術系職種）を行っている企業

【出力形式】
以下のJSON形式で出力してください。JSON以外のテキストは一切含めないでください。

{
  "companies": [
    {
      "id": "一意のスラッグ（例: toyota-motor）",
      "name": "企業名",
      "industry": "業界（例: 自動車・モビリティ）",
      "size": "大企業 | メガベンチャー | ベンチャー | スタートアップ",
      "summary": "ユーザーのキーワードに関連した、この企業の魅力を1〜2文で",
      "match_reason": "なぜこのキーワードにマッチするか（1文）",
      "match_level": "高 | 中"
    }
  ]
}

【注意事項】
- 実在する日本企業のみを挙げてください
- 技術系の新卒採用実績がある企業を優先してください
- 大企業だけでなく、知名度は低くても技術力の高い企業も含めてください
- キーワードとの関連性が高い順に並べてください`;
}

export function buildCompanyDetailPrompt(companyName: string): string {
  return `あなたは日本の就活に詳しいキャリアアドバイザーです。

「${companyName}」について、就活生向けに詳しい情報を提供してください。

【出力形式】
以下のJSON形式で出力してください。JSON以外のテキストは一切含めないでください。

{
  "overview": {
    "official_name": "正式名称",
    "headquarters": "本社所在地",
    "founded": "設立年",
    "employees": "従業員数（概算）",
    "revenue": "売上規模（直近、概算）",
    "description": "業界・事業領域の説明（3〜4文）"
  },
  "technology": {
    "tech_stack": ["使用技術を制限なくすべて列挙"],
    "products": [
      {"name": "プロダクト/サービス名", "description": "簡単な説明"}
    ],
    "tech_blog_url": "技術ブログURL（あれば、なければnull）",
    "github_url": "GitHubのURL（あれば、なければnull）"
  },
  "recruitment": {
    "positions": [
      {"title": "職種名", "description": "業務内容の簡単な説明"}
    ],
    "intern_period": "例年のインターン実施時期（具体的な月を記載。例: 夏期: 8月上旬〜9月中旬、冬期: 12月〜1月）",
    "application_deadline": "エントリー・ES提出締切の目安（夏インターン、本選考それぞれ）",
    "interview_schedule": "面接の実施時期と回数の目安",
    "selection_flow": "選考フローの概要",
    "hiring_count": "採用人数の目安（わかる範囲で）"
  },
  "compensation": {
    "starting_salary_master": "修士卒初任給（月額、わかる範囲で）",
    "average_salary": "平均年収（推定）",
    "work_locations": ["主要勤務地"],
    "remote_policy": "リモートワーク対応状況",
    "benefits_highlights": "福利厚生の特徴（2〜3個）"
  },
  "selection_tips": {
    "ideal_candidate": "求める人材像（2〜3文）",
    "common_questions": ["面接質問1", "面接質問2", "面接質問3"],
    "essay_advice": "ES・ガクチカで刺さりやすい方向性（2〜3文）"
  },
  "links": {
    "corporate_site": "企業の公式コーポレートサイトURL（トップページ、最も安定したURL）",
    "career_page": "新卒採用ページURL（確実に正しいURLのみ。不明な場合はnull）",
    "openwork_search": "https://www.openwork.jp/search/?freeword=${companyName}",
    "onecareer_search": "https://www.onecareer.jp/search?q=${companyName}"
  }
}

【注意事項】
- できる限り正確な情報を提供してください
- 不確実な情報には「（推定）」や「（要確認）」と明記してください
- URLは確認できるもののみ記載し、不明なものはnullとしてください
- 新卒・技術系に焦点を当ててください
- tech_stack にはその企業が使用している主要な技術をすべて列挙してください（数の制限なし）
- products にはその企業の主要なプロダクト・サービスをすべて列挙してください（数の制限なし）
- career_page はURLが頻繁に変わるため、確実に正しいURLのみ記載してください。不確実な場合はnullとしてください
- corporate_site は企業のメインドメインのトップページURLを記載してください`;
}

export function buildReviewPrompt(
  originalText: string,
  companyName: string,
  companyInfo: string,
  criteria: ReviewCriteria[],
  profile: { major: string; researchTheme: string; careerAxis: string; skills: string[] }
): string {
  return `あなたは日本のトップ企業に多数の内定者を輩出してきた就活のプロのESアドバイザーです。

以下のガクチカ（学生時代に力を入れたこと）を、指定企業に合わせて添削してください。

【ガクチカ原文】
${originalText}

【対象企業】
${companyName}

【企業の特徴・求める人材像】
${companyInfo}

【添削の観点】
${criteria.join("、")}

【ユーザーの基本情報】
- 専攻: ${profile.major}
- 研究テーマ: ${profile.researchTheme}
- 志望軸: ${profile.careerAxis}
- スキル: ${profile.skills.join(", ")}

【出力形式】
以下のJSON形式で出力してください。JSON以外のテキストは一切含めないでください。

{
  "revised_text": "添削後の全文（原文と同程度の文字数）",
  "score": 1〜5の整数,
  "score_reason": "スコアの理由（1文）",
  "improvements": [
    {
      "category": "改善カテゴリ（例: 具体性、論理構造、企業適合、差別化）",
      "before": "修正前の該当箇所",
      "after": "修正後の該当箇所",
      "reason": "なぜこの修正が効果的か（1〜2文）"
    }
  ],
  "strengths": ["原文の良い点1", "原文の良い点2"],
  "additional_tips": "この企業のESで特に意識すべきポイント（2〜3文）"
}

【注意事項】
- 原文の個性やエピソードは活かしつつ、企業の求める人材像に合うよう調整してください
- STAR法（Situation, Task, Action, Result）を意識した構成にしてください
- 数字や具体的な成果を入れられる箇所があれば提案してください
- 文字数は原文と大きく変わらないようにしてください（±50字以内）
- 嘘やでっち上げの実績は絶対に追加しないでください`;
}
