const globals = {
  window: "readonly",
  document: "readonly",
  // ...add other browser globals as needed...
};

module.exports = [
  {
    files: ["**/*.ts", "**/*.vue", "**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals,
      parser: require("vue-eslint-parser"),
      parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      vue: require("eslint-plugin-vue"),
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      // Prettier formatting
      "prettier/prettier": ["warn"],

      // TypeScript adjustments
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",

      // Vue adjustments
      "vue/max-attributes-per-line": ["warn", { singleline: 3 }],
      "vue/multi-word-component-names": "warn",
      "vue/no-mutating-props": "error",
      "vue/no-v-html": "warn",
    },
  },
  {
    files: ["*.ts", "*.vue"],
    rules: {
      "no-undef": "off", // TypeScript handles undefined checks
    },
  },
];
