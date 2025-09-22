import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { title, body, labels } = await req.json();
  const id = Math.floor(Math.random() * 100000);
  return NextResponse.json(
    {
      ok: true,
      url: `https://github.com/owner/repo/issues/${id}`,
      title,
      labels: labels || [],
    },
    { status: 200 },
  );
}

