import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function callRoute(runId: string) {
  const req = new NextRequest("http://localhost/api/settlements/runs/x/approve", {
    method: "POST",
  });
  return POST(req, { params: Promise.resolve({ runId }) });
}

// approve 응답을 넣으면 payout 응답을 내주는 fetch 모킹 헬퍼. approve/payout
// 호출을 각각 기록해 순서·인자를 검증한다.
function stubFetchSequence(responses: Response[]) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const next = responses[calls.length - 1];
    if (!next) throw new Error(`unexpected fetch call #${calls.length}: ${url}`);
    return next;
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, calls };
}

describe("POST /api/settlements/runs/[runId]/approve", () => {
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

  it("승인 성공 시 곧바로 payout을 호출하고 최종 상태만 돌려준다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    const { calls } = stubFetchSequence([
      new Response(
        JSON.stringify({
          settlement_run_id: "run_1",
          status: "APPROVED",
          approval_token: "super-secret-token",
        }),
        { status: 200 }
      ),
      new Response(
        JSON.stringify({ settlement_run_id: "run_1", status: "EXECUTING" }),
        { status: 200 }
      ),
    ]);

    const res = await callRoute("run_1");

    expect(calls[0].url).toBe("http://backend.internal/settlements/runs/run_1/approve");
    expect(calls[1].url).toBe("http://backend.internal/payouts");
    const payoutHeaders = calls[1].init?.headers as Record<string, string>;
    expect(payoutHeaders["X-Approval-Token"]).toBe("super-secret-token");
    expect(JSON.parse(calls[1].init?.body as string)).toEqual({
      settlement_run_id: "run_1",
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ settlement_run_id: "run_1", status: "EXECUTING" });
    // 브라우저로 나가는 응답 어디에도 토큰 원문이 없어야 한다.
    expect(JSON.stringify(body)).not.toContain("super-secret-token");
  });

  it("승인이 실패(403 캡 초과)하면 payout을 호출하지 않고 그 상태로 끝낸다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    const { calls } = stubFetchSequence([
      new Response(
        JSON.stringify({ detail: "MAX_AMOUNT_PER_BATCH_MINOR exceeded" }),
        { status: 403 }
      ),
    ]);

    const res = await callRoute("run_1");

    expect(calls).toHaveLength(1); // payout 호출 없음
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ detail: "MAX_AMOUNT_PER_BATCH_MINOR exceeded" });
  });

  it("승인이 404면 payout을 호출하지 않는다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    const { calls } = stubFetchSequence([
      new Response(
        JSON.stringify({ detail: "unknown settlement_run_id: run_1" }),
        { status: 404 }
      ),
    ]);

    const res = await callRoute("run_1");

    expect(calls).toHaveLength(1);
    expect(res.status).toBe(404);
  });

  it("승인이 200인데 토큰이 없으면 502로 명시적으로 실패한다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    const { calls } = stubFetchSequence([
      new Response(JSON.stringify({ settlement_run_id: "run_1", status: "APPROVED" }), {
        status: 200,
      }),
    ]);

    const res = await callRoute("run_1");

    expect(calls).toHaveLength(1); // payout 호출 없음
    expect(res.status).toBe(502);
  });

  it("payout이 실패하면 그 상태를 그대로 전달한다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    stubFetchSequence([
      new Response(
        JSON.stringify({
          settlement_run_id: "run_1",
          status: "APPROVED",
          approval_token: "tok",
        }),
        { status: 200 }
      ),
      new Response(
        JSON.stringify({
          detail: "multi-recipient FX aggregation not implemented — depends on matching (Track B)",
        }),
        { status: 501 }
      ),
    ]);

    const res = await callRoute("run_1");

    expect(res.status).toBe(501);
  });
});
