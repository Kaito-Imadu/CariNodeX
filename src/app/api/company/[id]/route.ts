import { NextRequest, NextResponse } from "next/server";
import { callGemini, parseGeminiJSON } from "@/lib/gemini";
import { buildCompanyDetailPrompt } from "@/lib/prompts";
import { CompanyDetail } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyName = req.nextUrl.searchParams.get("name");

    if (!companyName) {
      return NextResponse.json(
        { error: "企業名が指定されていません" },
        { status: 400 }
      );
    }

    const prompt = buildCompanyDetailPrompt(companyName);
    const text = await callGemini(prompt);
    const data = parseGeminiJSON<CompanyDetail>(text);

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Company detail API error:", error);
    return NextResponse.json(
      { error: "企業情報の取得中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
