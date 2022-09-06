import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "floating-vue/nuxt",
    "nuxt-lodash",
    "./modules/routeLogging",
  ],
  build: {
    transpile: ["@heroicons/vue"],
  },
  app: {
    baseURL: "/",
  },
  nitro: {
    storage: {
      redis: {
        driver: "redis",
        /* redis connector options */
        port: 6379, // Redis port
        host: "127.0.0.1", // Redis host
        username: "", // needs Redis >= 6
        password: "",
        db: 0, // Defaults to 0
      },
    },
  },
  experimental: {
    // externalVue: true,
  },
  autoImports: {
    dirs: ["store"],
  },
  colorMode: {
    classSuffix: "",
  },
  lodash: {
    exclude: ["head", "uniqueId"],
  },
});
