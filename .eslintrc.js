module.exports = {
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    sourceType: "module",
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/recommended",
    "plugin:nuxt/recommended",
    "@vue/eslint-config-typescript/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "vue", "nuxt"],
  rules: {
    "vue/no-v-model-argument": "off",
    "vue/multi-word-component-names": "off",
  },
};
