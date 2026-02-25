import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "src/_locked"]),

  // Base config
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },

  // v1.2.5 guardrails — Lovable UI must stay dumb + self-contained
  {
    files: ["src/ui/lovable/fee-confidence/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/*"],
              message:
                "Lovable UI must not use @/ alias imports. Use relative imports (./ or ../) to keep it self-contained.",
            },
            {
              group: [
                "@radix-ui/*",
                "class-variance-authority",
                "tailwind-merge",
              ],
              message:
                "Lovable UI must not depend on Radix/CVA/tailwind-merge. Keep Lovable UI dependency-free.",
            },
          ],
        },
      ],
    },
  },
]);