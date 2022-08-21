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
    "plugin:prettier/recommended",
    "plugin:vue/recommended",
    "plugin:nuxt/recommended",
    "@vue/eslint-config-typescript/recommended",
  ],
  plugins: ["@typescript-eslint", "prettier", "vue", "nuxt"],
  rules: {
    "vue/singleline-html-element-content-newline": "off",
    "vue/max-attributes-per-line": "off",
    "vue/html-indent": "off",
    "vue/html-self-closing": "off",
    "vue/valid-attribute-name": "off",
    "vue/valid-model-definition": "off",
  },
  overrides: [
    {
      files: ["layouts/**/*.vue", "pages/**/*.vue"],
      rules: {
        "vue/multi-word-component-names": "off",
      },
    },
  ],
};
