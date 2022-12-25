import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import vuejsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [vue(), vuejsx()],
  test: {
    environment: "jsdom",
    deps: {
      inline: [/@nuxt\/test-utils-edge/],
    },
  },
});
