import { NextRequest, NextResponse } from "next/server";
import { authHeadersFromRequest } from "@/lib/session";

// 얇은 BFF 프록시 — 백엔드가 만든 XLSX 바이트를 그대로 통과시킨다. web은
// 스프레드시트를 만들지 않는다(비즈니스 로직 없음 원칙).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
  }

  const res = await fetch(`${apiBase}/settlements/runs/${runId}/export`, {
    headers: authHeadersFromRequest(req),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "export failed" }));
    return NextResponse.json(body, { status: res.status });
  }

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = res.headers.get("content-disposition") ?? undefined;
  return new NextResponse(res.body, {
    status: res.status,
    headers: {
      "Content-Type": contentType,
      ...(contentDisposition ? { "Content-Disposition": contentDisposition } : {}),
    },
  });
}
