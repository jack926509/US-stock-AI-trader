import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 設計稿 mockup（CDN React，非 production 程式碼）
    "docs/mockups/**",
    // 已歸檔 MVP 砍掉的模組，僅供日後復原參考
    "docs/removed/**",
  ]),
]);

export default eslintConfig;
