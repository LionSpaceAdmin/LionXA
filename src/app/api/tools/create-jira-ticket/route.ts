import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { summary, description, issueType } = await req.json();
  const id = Math.floor(Math.random() * 100000);
  return NextResponse.json(
    {
      ok: true,
      url: `https://jira.example.com/browse/PROJ-${id}`,
      summary,
      issueType: issueType || "Task",
    },
    { status: 200 },
  );
}

