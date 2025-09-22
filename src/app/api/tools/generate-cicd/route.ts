import { NextResponse } from "next/server";

const ciYaml = `name: CI

on:
  push:
    branches: [ main, master ]
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Lint
        run: pnpm lint
      - name: Unit tests
        run: pnpm test
      - name: Build
        env:
          SKIP_GEMINI_CHECK: '1'
          DRY_RUN: '1'
        run: pnpm build
`;

export async function POST(req: Request) {
  const { platform } = await req.json();
  if (platform !== "github_actions") {
    return NextResponse.json({ error: "only github_actions supported in mock" }, { status: 400 });
  }
  return NextResponse.json({ yaml: ciYaml }, { status: 200 });
}

