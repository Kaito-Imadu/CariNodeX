import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseGeminiJSON } from "@/lib/gemini";
import { buildReviewPrompt } from "@/lib/prompts";
import { ReviewResult, ReviewCriteria } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { originalText, companyName, companyInfo, criteria, profile } = await req.json();

    if (!originalText || !companyName || !criteria?.length) {
      return NextResponse.json(
        { error: "必要な入力が不足しています" },
        { status: 400 }
      );
    }

    const prompt = buildReviewPrompt(
      originalText,
      companyName,
      companyInfo || "",
      criteria as ReviewCriteria[],
      profile || { major: "", researchTheme: "", careerAxis: "", skills: [] }
    );
    const text = await callGemini(prompt);
    const data = parseGeminiJSON<ReviewResult>(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { error: "添削中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
