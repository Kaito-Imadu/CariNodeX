// === 企業関連 ===
export interface CompanySearchResult {
  id: string;
  name: string;
  industry: string;
  size: CompanySize;
  summary: string;
  match_reason: string;
  match_level: "高" | "中";
}

export interface CompanyDetail {
  overview: {
    official_name: string;
    headquarters: string;
    founded: string;
    employees: string;
    revenue: string;
    description: string;
  };
  technology: {
    tech_stack: string[];
    products: { name: string; description: string }[];
    tech_blog_url: string | null;
    github_url: string | null;
  };
  recruitment: {
    positions: { title: string; description: string }[];
    intern_period: string;
    selection_flow: string;
    hiring_count: string;
  };
  compensation: {
    starting_salary_master: string;
    average_salary: string;
    work_locations: string[];
    remote_policy: string;
    benefits_highlights: string;
  };
  selection_tips: {
    ideal_candidate: string;
    common_questions: string[];
    essay_advice: string;
  };
  links: {
    career_page: string | null;
    openwork_search: string;
    onecareer_search: string;
  };
}

export type CompanySize = "大企業" | "メガベンチャー" | "ベンチャー" | "スタートアップ";

export type SelectionStatus = "未応募" | "ES提出済" | "面接中" | "内定" | "辞退";

export interface SavedCompany {
  id: string;
  name: string;
  industry: string;
  size: CompanySize;
  summary: string;
  status: SelectionStatus;
  deadline: string | null;
  memo: string;
  savedAt: string;
}

// === プロフィール関連 ===
export type GakuchikaCategory =
  | "部活・サークル"
  | "インターン・アルバイト"
  | "研究"
  | "留学"
  | "個人開発"
  | "資格・語学"
  | "その他";

export interface Gakuchika {
  id: string;
  title: string;
  category: GakuchikaCategory;
  content: string;
  tags: string[];
  order: number;
}

export interface UserProfile {
  name: string;
  university: string;
  major: string;
  researchTheme: string;
  careerAxis: string;
  selfPR: string;
  skills: string[];
  qualifications: string[];
  gakuchika: Gakuchika[];
}

// === ES添削関連 ===
export type ReviewCriteria =
  | "企業の求める人材像へのフィット度"
  | "論理構造・STAR法の改善"
  | "具体性・数字の追加提案"
  | "文章の読みやすさ・簡潔さ"
  | "差別化ポイントの強調";

export interface ReviewResult {
  revised_text: string;
  score: number;
  score_reason: string;
  improvements: {
    category: string;
    before: string;
    after: string;
    reason: string;
  }[];
  strengths: string[];
  additional_tips: string;
}

export interface ReviewHistoryItem {
  id: string;
  gakuchikaTitle: string;
  companyName: string;
  originalText: string;
  result: ReviewResult;
  criteria: ReviewCriteria[];
  reviewedAt: string;
}

// === ストレージ ===
export interface AppData {
  version: number;
  savedCompanies: SavedCompany[];
  profile: UserProfile;
  reviewHistory: ReviewHistoryItem[];
  searchCache: Record<string, { results: CompanySearchResult[]; cachedAt: string }>;
}
