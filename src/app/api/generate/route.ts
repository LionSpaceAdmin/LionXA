import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/gemini.ts";

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt נדרש" }, { status: 400 });
    }
    const text = await askGemini(prompt, model);
    return NextResponse.json({ text: text ?? "" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: message || "שגיאה בעיבוד הבקשה" },
      { status: 500 },
    );
  }
}
