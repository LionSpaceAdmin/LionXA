import { NextResponse } from "next/server";
import { conductArchitecturalReview } from "@/tools/conductArchitecturalReview";

export async function GET() {
  try {
    const result = await conductArchitecturalReview();
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error("/api/health failed:", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

