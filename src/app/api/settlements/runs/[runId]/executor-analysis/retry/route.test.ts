import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function callRoute(runId: string) {
  const req = new NextRequest(
    `http://localhost/api/settlements/runs/${runId}/executor-analysis/retry`,
    { method: "POST" }
  );
  return POST(req, { params: Promise.resolve({ runId }) });
}

describe("POST /api/settlements/runs/[runId]/executor-analysis/retry", () => {
  const originalApiBaseUrl = process.env.API_BASE_URL;

  afterEach(() => {
    process.env.API_BASE_URL = originalApiBaseUrl;
    vi.unstubAllGlobals();
  });

  it("API_BASE_URL이 없으면 500을 반환한다", async () => {
    delete process.env.API_BASE_URL;

    const res = await callRoute("run_1");

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "API_BASE_URL not set" });
  });

  it("api POST를 그대로 프록시하고 응답을 그대로 돌려준다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    const calls: { url: string; init?: RequestInit }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, init });
        return new Response(JSON.stringify({ executor_analysis: null }), { status: 200 });
      })
    );

    const res = await callRoute("run_1");

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(
      "http://backend.internal/settlements/runs/run_1/executor-analysis/retry"
    );
    expect(calls[0].init?.method).toBe("POST");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ executor_analysis: null });
  });

  it("api가 409(DRAFT 아님)면 그 상태를 그대로 전달한다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ detail: "settlement_run status is APPROVED, expected DRAFT" }),
          { status: 409 }
        )
      )
    );

    const res = await callRoute("run_1");

    expect(res.status).toBe(409);
  });
});
