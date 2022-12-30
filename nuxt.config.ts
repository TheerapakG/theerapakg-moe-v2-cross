// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    // "floating-vue/nuxt",
    "nuxt-lodash",
    "./modules/routeLogging",
  ],
  app: {
    baseURL: "/",
  },
  runtimeConfig: {
    public: {
      apiBaseURL: null,
    },
    downloadPath: process.env.NUXT_DOWNLOAD_PATH ?? "",
    meiliSearchKey: process.env.NUXT_MEILI_SEARCH_KEY ?? "",
    meiliApiKey: process.env.NUXT_MEILI_API_KEY ?? "",
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
  vite: {
    ssr: {
      noExternal: ["monaco-editor"],
    },
  },
  experimental: {
    // externalVue: true,
  },
  imports: {
    dirs: ["store"],
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  colorMode: {
    classSuffix: "",
  },
  lodash: {
    exclude: ["head", "uniqueId"],
  },
});
