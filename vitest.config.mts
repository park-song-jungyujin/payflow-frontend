import path from "node:path";
import { defineConfig } from "vitest/config";

// tsconfig.json의 "@/*" -> "./src/*" 별칭을 vitest 쪽에도 맞춰준다.
// 새 패키지를 추가하지 않고 vitest가 이미 들고 있는 vite alias만 쓴다.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
