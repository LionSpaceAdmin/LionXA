import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // eslint-disable-next-line no-console
    console.log("Received data from agent:", data);

    // TODO: Persist to DB or broadcast via WebSockets as needed

    return NextResponse.json({ message: "Data received successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process report" }, { status: 500 });
  }
}

