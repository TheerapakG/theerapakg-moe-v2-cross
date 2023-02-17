import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import vuejsx from "@vitejs/plugin-vue-jsx";
import { Plugin } from "vite";

export default defineConfig({
  plugins: [vue(), vuejsx()] as Plugin[],
  test: {
    environment: "jsdom",
    deps: {
      inline: [/@nuxt\/test-utils-edge/],
    },
  },
});
