import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { buildChatPrompt, ChatMessage } from "@/lib/prompts";
import { CompanyDetail } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { companyName, companyDetail, history, question } = await req.json() as {
      companyName: string;
      companyDetail: CompanyDetail;
      history: ChatMessage[];
      question: string;
    };

    if (!companyName || !question) {
      return NextResponse.json(
        { error: "企業名と質問を入力してください" },
        { status: 400 }
      );
    }

    const prompt = buildChatPrompt(companyName, companyDetail, history, question);
    const text = await callGemini(prompt, { jsonMode: false });

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "回答の生成中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
