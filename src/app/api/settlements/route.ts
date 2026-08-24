import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// 얇은 BFF 프록시 — 목록 조회만, 로직 없음.
export async function GET(req: NextRequest) {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const res = await fetch(`${apiBase}/settlements`, { headers: authHeadersFromRequest(req) });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
