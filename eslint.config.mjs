// eslint.config.js
import js from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  // Global ignores
  {
    ignores: ["build/**/*", "node_modules/**/*", "**/*.js"],
  },

  // Main configuration
  {
    files: ["src/**/*.{js,ts}", "test/**/*.{js,ts}"],

    languageOptions: {
      globals: globals.node,
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    plugins: {
      "@typescript-eslint": tsEslint,
    },

    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,

      // TypeScript recommended rules
      ...tsEslint.configs.recommended.rules,
      ...tsEslint.configs["recommended-requiring-type-checking"].rules,

      // Custom TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/no-magic-numbers": "off",

      // General rules
      "no-console": "off",
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "no-magic-numbers": "off",
    },
  },
];
