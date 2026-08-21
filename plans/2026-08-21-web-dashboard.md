# 집행자 웹 대시보드 구현 계획

Track B ⑥. **아직 구현 안 함 — 계획만.** plan.md의 web 체크리스트 6항목을 실제
백엔드 API와 대조해 정확히 무엇을 만들지 정한다.

## Global Constraints

- `web`은 시크릿이 없다. `API_BASE_URL`은 서버 사이드 env(BFF route handler
  안에서만 접근). `NEXT_PUBLIC_`에 민감 정보 금지.
- 비즈니스 로직 금지 — 금액 계산, 상태 전이, 이상 탐지는 전부 `api` 소관.
  web은 받은 값을 그대로 렌더링한다.
- 정산 모델 타입은 손으로 안 쓴다. `npx openapi-typescript`로 생성.
- 새 npm 의존성은 꼭 필요할 때만 추가한다 — 지금 `package.json`에 데이터
  페칭·상태관리 라이브러리가 없다. 없이 되면 안 늘린다(해커톤, "동작하는
  200줄").

## 확정된 판단 (근거 포함)

### 1. 승인과 송금을 하나의 서버 액션으로 묶는다 — 토큰이 브라우저에 안 나가게

`POST /settlements/runs/{run_id}/approve`는 승인 토큰을 **평문으로 한 번만**
응답 본문에 싣는다(`money-safety.md`: 저장은 해시만, 원문은 응답에만). 이
토큰을 브라우저로 내려보내고 브라우저가 다시 `X-Approval-Token` 헤더로
`/payouts`에 보내는 2단계 왕복을 만들면, 토큰이 네트워크 탭·브라우저 메모리에
잠깐이라도 노출된다.

**대신 Next.js route handler 안에서 approve → payout을 순차로 호출한다.**
토큰은 Next.js 서버 프로세스 메모리에만 존재하고 브라우저에는 최종 상태
(`EXECUTING` 등)만 내려간다. 사람이 판단하는 시점은 "승인 및 송금" 버튼을
누르기 **전**(요약 카드를 보고 결정)이지, 토큰 발급과 송금 사이가 아니다 —
토큰 자체가 10분 TTL·금액 해시 바인딩·1회용으로 설계돼 있어 발급 후 지연 없이
바로 소비되는 게 의도에 맞는다.

기존 `route.ts`(승인만 하고 토큰을 그대로 돌려주던 자리)는 이 설계로 교체한다
— plan.md에 "A/C의 E2E 확인용으로 최소 동작시켜 둔 자리"라고 이미 TODO가
남아 있다.

### 2. 자연어 입력은 이번 스코프에서 뺀다

Part 3/4에서 이미 결정한 것 — 자연어→필터 변환은 `settlement_run_id`가 없는
시점 호출이라 세션·draft 모델과 안 맞고, 이걸 처리할 백엔드 엔드포인트 자체가
아직 없다. 지금 만들면 존재하지 않는 API를 가정하고 프론트를 쌓는 셈이다.

**MVP는 폼 기반 필터로 시작한다.** `SettlementFilter`의 필드 중
`period_start`·`period_end`·`account_categories`만 폼으로 받는다.
`recipient_ids`는 뺀다 — 아래 4번 참조. 자연어 입력창은 Phase 2로 남기고,
백엔드에 대응 엔드포인트가 생기면 이 폼 옆에 **추가**한다(대체가 아니다 —
`agent-tools.md`의 기존 결정과 일치).

### 3. 데이터 페칭은 Server Component, mutation은 Route Handler(BFF)

Next.js 16 App Router 기준. 목록·상세 조회는 서버 컴포넌트에서 직접
`fetch(API_BASE_URL + ...)`. 승인·실행처럼 부수효과가 있는 액션만 route
handler를 거친다(이미 있는 `approve/route.ts` 패턴 그대로). SWR·React Query
같은 걸 새로 안 붙인다 — 목록은 페이지 이동마다 새로 받아오는 것으로 충분하고,
실행 중(`EXECUTING`) 상태 갱신은 5번 항목의 가벼운 폴링으로 해결한다.

### 4. `recipient_ids` 필터는 뺀다 — 채울 데이터가 없다

`GET /recipients` 같은 조회 엔드포인트가 백엔드에 없다. 드롭다운을 채우려면
새 엔드포인트가 필요한데, 그건 API 스키마 변경(§6 나가는 필드 최소화 검토
포함)이라 web 레포 혼자 결정할 사안이 아니다. `account_categories`는 7개
고정 enum이라 프론트에 하드코딩한 매핑 상수로 바로 렌더 가능하다(§5, 아래
5번 참조) — 이건 새 엔드포인트 없이 된다.

### 5. 계정과목 표시명은 프론트가 자체 매핑 상수로 가진다

`schema-contract.md` §5: "web은 OpenAPI 생성 타입으로 코드값을 받고 자체
매핑 상수로 렌더한다." 백엔드 `CATEGORY_DISPLAY`와 값을 맞춘 상수를
`src/lib/accountCategory.ts`에 둔다. 7개뿐이라 API로 받아올 필요가 없다.

```ts
export const ACCOUNT_CATEGORY_LABEL: Record<string, string> = {
  PAYMENT_FEE: "지급수수료",
  EMPLOYEE_BENEFIT: "복리후생비",
  TRAVEL: "여비교통비",
  SUPPLIES: "소모품비",
  ADVERTISING: "광고선전비",
  RENT: "지급임차료",
  UNCLASSIFIED: "미분류",
};
```

### 6. 다중 수취인 run은 송금 버튼을 비활성화한다

`payouts/routes.py`의 `get_sole_recipient_id`가 claim들의 recipient가 둘
이상이면 `None`을 돌려주고, `/payouts`·`/payouts/{run_id}/retry`·
`/tasks/execute-payout` 전부 501을 낸다(멀티 수취인 통화 합산은 아직
matching(B)이 안 끝났다는 주석이 코드에 그대로 있다). 프론트가 이걸 모르고
버튼을 활성화해두면 사람이 승인까지 눌렀는데 송금이 501로 막히는 걸 보게
된다 — 승인은 됐는데 못 갚는 배치가 `APPROVED` 상태로 남는다.

**막는 방법:** run 상세 응답에 연결된 claim들의 `recipient_id`가 유일한지
프론트가 직접 계산해서(claim 목록은 아래 "필요한 백엔드 변경" 참조) 다르면
"송금 실행" 버튼을 비활성화하고 이유를 보여준다("이 배치는 수취인이 2명
이상이라 아직 자동 송금을 지원하지 않습니다"). 근본 해결(다중 수취인 통화
합산)은 프론트 일이 아니라 B의 백엔드 몫으로 별도 항목에 남긴다.

### 7. `EXECUTING` 상태는 클라이언트에서 가볍게 폴링한다

송금은 `/payouts` 호출 후 `EXECUTING`으로 마킹되고 실제 결과는 Cloud Tasks의
`/tasks/execute-payout` → `/tasks/reconcile`이 비동기로 채운다(§8). 사람이
버튼을 누른 뒤 화면이 멈춰 있으면 안 된다 — 새 의존성 없이 클라이언트
컴포넌트에서 `useEffect` + `setInterval`(5초)로 run 상세를 다시 받아오다가
`SETTLED`/`FAILED`가 되면 멈춘다.

### 8. Task 0 — OpenAPI 타입 생성이 다른 모든 작업의 선행 조건

`npx openapi-typescript`는 **로컬에서 실제로 떠 있는 api**가 필요하다. 이
계획을 세운 시점엔 GCP 접근 없이 로컬 api를 못 띄웠다 — 구현 착수 시 가장
먼저 할 일이다. 그전까지 컴포넌트 작업을 진행해야 하면 `tests/openapi.snapshot.json`
(레포에 커밋돼 있음)을 임시로 참조해 타입을 손으로 스텁해두고, 생성기를
돌릴 수 있게 되면 교체한다 — 생성 파일에 손대지 않는다는 규칙은 그대로다.

## 필요한 백엔드 변경 (선행 조건, web 레포 작업 아님)

이 계획을 세우면서 **web이 필요로 하는데 지금 API에 없는 것 두 가지**를
발견했다. 프론트 작업을 시작하기 전에(또는 병행해서) B가 backend에서 먼저
채워야 한다.

### (a) `GET /settlements/runs/{run_id}`에 `claims` 필드 추가

지금 이 엔드포인트는 run 문서 자체와(Part 5에서 추가한) `executor_analysis`만
돌려준다. "정산 명세"(plan.md 요약 카드 요건 — 어떤 claim이 얼마씩 걸려
있는지)를 보여주려면 claim별 상세가 필요한데, 그런 필드가 없다.

**제안 구현** (참고용 스펙 — 지금 안 만듦):

```python
# src/settlements/routes.py, get_settlement_run_route 안에
claims = get_claims_for_run(run_id)          # payouts/store.py, 이미 있음
receipts = store.get_receipts({c["receipt_id"] for c in claims})  # settlements/store.py, 이미 있음
public["claims"] = [_claim_summary(c, receipts) for c in claims]  # _claim_summary 재사용
```

`_claim_summary`는 Part 4에서 이미 만든 함수라 새로 짤 게 없다 — 호출 지점만
늘리면 된다. 6번 항목의 "수취인 유일성 판정"도 이 필드로 프론트가 직접
계산한다(별도 `is_single_recipient` 필드를 백엔드가 안 만들어도 된다,
`new Set(claims.map(c => c.recipient_id)).size === 1`로 충분).

### (b) 승인+송금 체이닝 route handler

1번 결정을 실제로 짜려면 `payflow-frontend/src/app/api/settlements/runs/[runId]/approve/route.ts`가 approve 응답의 토큰을 받아 그 자리에서 바로 `POST {API_BASE_URL}/payouts`를 호출하도록 바꿔야 한다. 이건 web 레포 파일이라 (a)와 달리 이 계획의 Task로 들어간다(아래 Task 4).

## 범위 밖 (Won't-Have, 이번 패스)

- 자연어 입력창 (2번 결정)
- `recipient_ids` 필터 UI (4번 결정)
- 안전 확인 에이전트(`safety_report`) 표시 — 백엔드가 아직 그 필드를 안
  내려준다(Part 5 미결 항목)
- `미분류` 계정과목을 웹에서 사람이 직접 재분류하는 UI — plan.md 체크리스트엔
  있지만 집행자 에이전트가 그 판단을 아직 안 만든다(Part 3에서 뺀 범위)
- 로그인/인증 — `approved_by`는 지금 백엔드 기본값(`demo_approver`)에 의존.
  실제 사용자 식별은 해커톤 스코프 밖
- 다중 수취인 배치의 통화 합산·송금 — 백엔드 작업, 6번 항목 참조
- 반응형/모바일 최적화 — 데모는 데스크톱 화면 녹화 기준

## File Structure

```
src/
  app/
    page.tsx                                    # 대시보드 (목록 + 새 실행 폼)
    runs/
      [runId]/
        page.tsx                                # 요약 카드 (상세)
        status-poller.tsx                        # "use client" — 7번 결정 폴링
    api/
      settlements/
        route.ts                                 # GET (이미 있음, 안 건드림)
        runs/
          route.ts                                # POST 신규 — 배치 생성 프록시
          [runId]/
            route.ts                              # GET 신규 — 상세 프록시
            approve/
              route.ts                            # POST 교체 — 승인+송금 체이닝
            export/
              route.ts                            # GET 신규 — XLSX 스트리밍 프록시
  lib/
    accountCategory.ts                            # 5번 결정 매핑 상수
    settlementStatus.ts                            # status → 한국어 라벨 + 색
  types/
    api.d.ts                                       # openapi-typescript 생성물 (Task 0)
```

## Task 목록

### Task 0 — OpenAPI 타입 생성 파이프라인

- 로컬 api 기동, `npx openapi-typescript http://localhost:8080/openapi.json -o src/types/api.d.ts`
- 생성 파일 상단에 생성 명령 주석, 그대로 커밋
- 완료 기준: `src/types/api.d.ts`가 `SettlementRun`·`Claim`·`SettlementFilter` 타입을 포함

### Task 1 — 대시보드 (`/`)

- `GET /api/settlements` 서버 컴포넌트에서 fetch → 목록 렌더 (run_id, status, base_currency, total_amount_minor)
- status는 `lib/settlementStatus.ts`의 한국어 라벨로 렌더 (DRAFT/APPROVED/EXECUTING/SETTLED/FAILED)
- "새 정산 실행" 폼 — `period_start`, `period_end`(date input), `account_categories`(다중 체크박스, `ACCOUNT_CATEGORY_LABEL` 순회)
- 제출 시 `POST /api/settlements/runs`(Task 2) → 성공하면 `/runs/[runId]`로 이동
- 완료 기준: 필터 없이("전체") 실행 생성 가능, 카테고리 필터링해서 생성 가능

### Task 2 — `POST /api/settlements/runs` (신규 BFF route)

- body를 그대로 `{filter: {...}}` 형태로 감싸 `POST {API_BASE_URL}/settlements/runs`에 프록시
- 로직 없음 — 얇은 프록시 원칙 그대로

### Task 3 — `GET /api/settlements/runs/[runId]` (신규 BFF route) + 요약 카드 (`/runs/[runId]`)

- 선행: 백엔드 변경 (a) 완료 — `claims` 필드가 응답에 있어야 함
- 렌더: run 메타(상태·통화·총액), claim 목록 표(가맹점명·거래일자·금액·계정과목),
  `executor_analysis`(있으면 `anomalies` 목록 + `summary_text`, 없으면
  "분석 대기 중" — Part 5에서 이미 None과 빈 배열을 구분해뒀다), XLSX 다운로드
  버튼(Task 5)
- 6번 결정 — `new Set(claims.map(...))`로 수취인 유일성 계산, 다중이면 승인
  버튼에 비활성 사유 표시
- 완료 기준: `executor_analysis`가 None일 때와 `{anomalies: [], summary_text: "이상 없음"}`일 때 다르게 보임

### Task 4 — 승인 카드 (approve + payout 체이닝)

- 1번 결정대로 `route.ts` 교체: `POST {API_BASE_URL}/settlements/runs/{runId}/approve`
  → 응답에서 `approval_token` 추출 → 즉시 `POST {API_BASE_URL}/payouts`에
  `X-Approval-Token` 헤더로 전달 → 최종 상태만 브라우저에 반환
- approve가 403(한도 초과)이면 그 상태로 즉시 반환, payout 호출 안 함
- 완료 기준: 브라우저 네트워크 탭 어디에도 `approval_token` 원문이 안 보임

### Task 5 — XLSX 내보내기 프록시

- `GET /api/settlements/runs/[runId]/export`가 백엔드 스트림을 그대로 통과
- `Content-Disposition` 헤더 유지

### Task 6 — 상태 폴링

- `status-poller.tsx`("use client") — `EXECUTING`일 때만 5초 간격으로
  `GET /api/settlements/runs/[runId]` 재요청, `SETTLED`/`FAILED` 도달 시 중단
- 완료 기준: 새 탭 새로고침 없이 실행 중 → 완료 상태 전환이 화면에 반영

## 데모 시나리오 매핑

| fixture | 화면에서 확인할 것 |
|---|---|
| 1 (골든 패스, USD 항목 포함) | 목록 → 상세 → 승인 → 송금 전 과정, `fx_rates` 반영된 총액 |
| 3 (중복 청구 의심) | 상세 화면 `executor_analysis.anomalies`에 중복 서술 노출 |
| 7 (한도 캡 초과) | 승인 버튼 클릭 시 403, 브라우저에 캡 초과 사유 표시(토큰 발급 자체가 안 됨) |
| 8 (PayPal FAILED/UNCLAIMED 혼재) | Task 6 폴링으로 `FAILED` 전환 확인, 재발송은 이번 스코프 밖(버튼 없음) |

토큰 없는 `/payouts` 호출 거부(Must-Have 데모 5초 장면)는 curl/터미널로
보여주는 게 자연스럽다 — 브라우저는 애초에 토큰을 안 들고 있어서(1번 결정)
이 장면 자체를 UI로 재현할 방법이 없다. 별도 UI 불필요.

## 리스크 / 미결

| 항목 | 내용 |
|---|---|
| 백엔드 변경 (a)·(b) 순서 | (a)는 B의 backend 작업, (b)는 web 작업(Task 4) — (a) 없이 Task 3을 끝까지 못 만든다 |
| Task 0이 GCP 접근을 요구 | 로컬 api 기동에 Firestore ADC 등이 필요 — 이 계획을 세운 샌드박스에서는 실행 못 해봤다 |
| `approved_by` 하드코딩 | 로그인이 없어 백엔드 기본값(`demo_approver`)을 그대로 씀. 데모 화면에 실명이 안 뜬다 |
| 다중 수취인 UX가 "안내"뿐 | 근본 해결 전까지는 막는 것 이상을 못 한다 — 데모 데이터셋이 전부 단일 수취인인지 확인 필요 |
| `next.config.ts` API 프록시 미검토 | rewrites로 API_BASE_URL을 감출지, route handler로만 갈지 — 지금 계획은 후자로만 짰다(기존 코드와 일관) |
