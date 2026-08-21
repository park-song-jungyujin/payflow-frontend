import { NextRequest, NextResponse } from "next/server";
import type { SettlementFilter } from "@/types/settlement";

// 얇은 BFF 프록시 — 필터를 그대로 감싸 넘긴다. 후보 조회·검증·매칭·enqueue는
// 전부 api(settlements/routes.py) 소관이다.
export async function POST(req: NextRequest) {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const filter: SettlementFilter = await req.json().catch(() => ({}));

  const res = await fetch(`${apiBase}/settlements/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter }),
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
