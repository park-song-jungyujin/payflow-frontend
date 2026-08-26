import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// approve/route.ts와 같은 BFF 프록시 패턴 — 얇게 backend로 전달만 한다.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string; claimId: string }> }
) {
  const { runId, claimId } = await params;
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const session = authHeadersFromRequest(req);
  const res = await fetch(`${apiBase}/settlements/runs/${runId}/claims/${claimId}/exclude`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...session },
    body: JSON.stringify(body),
  });
  const resBody = await res.json();
  return NextResponse.json(resBody, { status: res.status });
}
