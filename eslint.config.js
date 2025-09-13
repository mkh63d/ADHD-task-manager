import { defineConfig } from "eslint-define-config";

export default defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    sourceType: "module",
    extraFileExtensions: [".vue"],
  },
  plugins: ["@typescript-eslint", "vue", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",           // Vue 3 recommended rules
    "plugin:@typescript-eslint/recommended", // TypeScript recommended rules
    "plugin:prettier/recommended",           // Prettier integration
  ],
  rules: {
    // Prettier formatting
    "prettier/prettier": ["warn"],

    // TypeScript recommended adjustments
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-function-return-type": "off",

    // Vue recommended adjustments
    "vue/max-attributes-per-line": ["warn", { singleline: 3 }],
    "vue/multi-word-component-names": "warn",
    "vue/no-mutating-props": "error",
    "vue/no-v-html": "warn",
  },
  overrides: [
    {
      files: ["*.ts", "*.vue"],
      rules: {
        "no-undef": "off", // TypeScript handles undefined checks
      },
    },
  ],
});
