import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseGeminiJSON } from "@/lib/gemini";
import { buildSearchPrompt } from "@/lib/prompts";
import { CompanySearchResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { keywords, sizes } = await req.json();

    if (!keywords || !sizes?.length) {
      return NextResponse.json(
        { error: "キーワードと企業規模を入力してください" },
        { status: 400 }
      );
    }

    const prompt = buildSearchPrompt(keywords, sizes);
    const text = await callGemini(prompt);
    const data = parseGeminiJSON<{ companies: CompanySearchResult[] }>(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "企業の検索中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
