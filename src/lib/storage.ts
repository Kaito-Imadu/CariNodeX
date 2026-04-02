import { AppData, SavedCompany, UserProfile, ReviewHistoryItem, CompanySearchResult } from "@/types";

const STORAGE_KEY = "jobradar_data";
const CURRENT_VERSION = 1;

function getDefaultProfile(): UserProfile {
  return {
    name: "",
    university: "",
    major: "",
    researchTheme: "",
    careerAxis: "",
    selfPR: "",
    skills: [],
    qualifications: [],
    gakuchika: [],
  };
}

function getDefaultData(): AppData {
  return {
    version: CURRENT_VERSION,
    savedCompanies: [],
    profile: getDefaultProfile(),
    reviewHistory: [],
    searchCache: {},
  };
}

function loadData(): AppData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const data = JSON.parse(raw) as AppData;
    if (data.version !== CURRENT_VERSION) {
      return { ...getDefaultData(), ...data, version: CURRENT_VERSION };
    }
    return data;
  } catch {
    return getDefaultData();
  }
}

function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// === 企業管理 ===
export function getSavedCompanies(): SavedCompany[] {
  return loadData().savedCompanies;
}

export function saveCompany(company: Omit<SavedCompany, "status" | "deadline" | "memo" | "savedAt">): void {
  const data = loadData();
  if (data.savedCompanies.some((c) => c.id === company.id)) return;
  data.savedCompanies.push({
    ...company,
    status: "未応募",
    deadline: null,
    memo: "",
    savedAt: new Date().toISOString(),
  });
  saveData(data);
}

export function removeCompany(id: string): void {
  const data = loadData();
  data.savedCompanies = data.savedCompanies.filter((c) => c.id !== id);
  saveData(data);
}

export function updateCompany(id: string, updates: Partial<SavedCompany>): void {
  const data = loadData();
  data.savedCompanies = data.savedCompanies.map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  saveData(data);
}

export function isCompanySaved(id: string): boolean {
  return loadData().savedCompanies.some((c) => c.id === id);
}

// === プロフィール ===
export function getProfile(): UserProfile {
  return loadData().profile;
}

export function saveProfile(profile: UserProfile): void {
  const data = loadData();
  data.profile = profile;
  saveData(data);
}

// === 添削履歴 ===
export function getReviewHistory(): ReviewHistoryItem[] {
  return loadData().reviewHistory;
}

export function addReviewHistory(item: ReviewHistoryItem): void {
  const data = loadData();
  data.reviewHistory.unshift(item);
  if (data.reviewHistory.length > 10) {
    data.reviewHistory = data.reviewHistory.slice(0, 10);
  }
  saveData(data);
}

// === 検索キャッシュ ===
export function getCachedSearch(key: string): CompanySearchResult[] | null {
  const data = loadData();
  const cached = data.searchCache[key];
  if (!cached) return null;
  const age = Date.now() - new Date(cached.cachedAt).getTime();
  if (age > 1000 * 60 * 60) {
    delete data.searchCache[key];
    saveData(data);
    return null;
  }
  return cached.results;
}

export function setCachedSearch(key: string, results: CompanySearchResult[]): void {
  const data = loadData();
  data.searchCache[key] = { results, cachedAt: new Date().toISOString() };
  saveData(data);
}
