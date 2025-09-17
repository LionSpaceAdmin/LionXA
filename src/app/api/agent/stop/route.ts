// src/app/api/agent/stop/route.ts
import { NextResponse } from 'next/server';
import { stopAgentProcess } from '@/lib/agent-manager';

export async function POST() {
  console.log("API: Received request to stop agent.");
  const result = stopAgentProcess();
  if (result.success) {
    return NextResponse.json({ message: result.message });
  } else {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }
}
