// src/app/api/agent/start/route.ts
import { NextResponse } from 'next/server';
import { startAgentProcess } from '@/lib/agent-manager';

export async function POST() {
  console.log("API: Received request to start agent.");
  const result = startAgentProcess();
  if (result.success) {
    return NextResponse.json({ message: result.message });
  } else {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }
}
