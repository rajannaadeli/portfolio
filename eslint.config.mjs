import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Pin the React version so eslint-plugin-react skips filesystem-based version
  // detection, which crashes under ESLint 10 (a getFilename context-API change).
  { settings: { react: { version: "19.2" } } },
  // Generated / vendored artifacts.
  globalIgnores([
    "scripts/**",
    "lib/generated/**",
    "cases/**",
  ]),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
