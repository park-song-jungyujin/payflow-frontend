# payflow-frontend (`web`)

Next.js / TypeScript. Cloud Run 배포. **시크릿을 갖지 않는다.**

## 이 레포의 책임

- 관리자 대시보드 화면, 승인 카드 UI
- 서버 액션 / route handler는 `api`로 넘기는 얇은 BFF 프록시만 담당한다

## 하지 말 것

- 비즈니스 로직 두기 — 금액 계산, 상태 전이, 이상 탐지 전부 `api` 소관이다
- Firestore 직접 읽기
- `NEXT_PUBLIC_` 접두사가 붙은 값에 민감 정보 넣기
- 정산 모델 타입 손으로 쓰기 — `api`의 OpenAPI로 생성한다

```bash
# api 로컬 실행 후
npx openapi-typescript http://localhost:8080/openapi.json -o src/types/api.d.ts
```

생성 파일은 커밋하고 손으로 편집하지 않는다. 상단에 생성 명령을 주석으로 남긴다.

## 공통 규칙

@docs/CLAUDE.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
