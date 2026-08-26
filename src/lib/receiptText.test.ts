import { describe, expect, it } from "vitest";
import { itemDisplayName, merchantDisplay } from "@/lib/receiptText";

describe("itemDisplayName", () => {
  it("en 로케일에선 Gemma가 번역한 name_en을 쓴다", () => {
    expect(itemDisplayName({ name: "G)콜드브루", name_en: "G) Cold Brew", amount_minor: 4500 }, "en")).toBe(
      "G) Cold Brew"
    );
  });

  it("ko 로케일에선 영수증 원문 name을 쓴다", () => {
    expect(itemDisplayName({ name: "G)콜드브루", name_en: "G) Cold Brew", amount_minor: 4500 }, "ko")).toBe(
      "G)콜드브루"
    );
  });

  // 번역 실패나 이 필드 추가 전에 파싱된 영수증 — 빈 칸보다 한국어 원문이 낫다.
  it("name_en이 없으면 en 로케일에서도 name으로 폴백한다", () => {
    expect(itemDisplayName({ name: "G)콜드브루", amount_minor: 4500 }, "en")).toBe("G)콜드브루");
  });

  it("name_en이 빈 문자열이면 폴백한다", () => {
    expect(itemDisplayName({ name: "배송비", name_en: "", amount_minor: null }, "en")).toBe("배송비");
  });
});

describe("merchantDisplay", () => {
  it("en 로케일에선 번역명을 앞에, 원문을 괄호 줄로 함께 준다", () => {
    expect(merchantDisplay("스타벅스 강남점", "Starbucks Gangnam", "en")).toEqual({
      primary: "Starbucks Gangnam",
      original: "스타벅스 강남점",
    });
  });

  it("ko 로케일에선 원문만 쓰고 괄호 줄을 만들지 않는다", () => {
    expect(merchantDisplay("스타벅스 강남점", "Starbucks Gangnam", "ko")).toEqual({
      primary: "스타벅스 강남점",
      original: null,
    });
  });

  it("번역이 없으면 en 로케일에서도 원문만 쓴다", () => {
    expect(merchantDisplay("스타벅스 강남점", null, "en")).toEqual({
      primary: "스타벅스 강남점",
      original: null,
    });
  });

  // 원래 영어 상호(예: "IKEA")는 번역해도 같은 값이 온다 — 같은 이름을
  // 괄호로 한 번 더 적으면 잡음이다.
  it("번역이 원문과 같으면 괄호 줄을 만들지 않는다", () => {
    expect(merchantDisplay("IKEA", "IKEA", "en")).toEqual({ primary: "IKEA", original: null });
  });

  it("앞뒤 공백만 다른 번역도 같은 이름으로 본다", () => {
    expect(merchantDisplay("IKEA", "  IKEA ", "en")).toEqual({ primary: "IKEA", original: null });
  });

  // 가맹점명을 아예 못 읽은 영수증(receipts.merchant_name은 nullable).
  it("가맹점명이 없으면 primary도 null이다", () => {
    expect(merchantDisplay(null, null, "en")).toEqual({ primary: null, original: null });
  });
});
