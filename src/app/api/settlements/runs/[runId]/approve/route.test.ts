import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function callRoute(runId: string) {
  const req = new NextRequest("http://localhost/api/settlements/runs/x/approve", {
    method: "POST",
  });
  return POST(req, { params: Promise.resolve({ runId }) });
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

  it("api의 응답을 status·body 그대로 프록시한다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ settlement_run_id: "run_1", status: "APPROVED" }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await callRoute("run_1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.internal/settlements/runs/run_1/approve",
      expect.objectContaining({ method: "POST" })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ settlement_run_id: "run_1", status: "APPROVED" });
  });

  it("api가 에러 status를 주면 그대로 전달한다", async () => {
    process.env.API_BASE_URL = "http://backend.internal";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "unknown settlement_run_id: run_1" }), {
          status: 404,
        })
      )
    );

    const res = await callRoute("run_1");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ detail: "unknown settlement_run_id: run_1" });
  });
});
