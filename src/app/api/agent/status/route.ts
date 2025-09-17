// src/app/api/agent/status/route.ts
import { NextResponse } from 'next/server';
import { getAgentState } from '@/lib/agent-manager';

export async function GET() {
  const state = getAgentState();
  return NextResponse.json(state);
}
