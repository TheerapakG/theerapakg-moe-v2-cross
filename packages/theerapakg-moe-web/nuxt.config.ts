// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: ["@nuxthq/ui", "@pinia/nuxt", "@vueuse/nuxt", "nuxt-lodash"],

  app: {
    baseURL: "/",
    pageTransition: {
      enterFromClass: "opacity-0",
      leaveToClass: "opacity-0",
      enterActiveClass: "transition-opacity duration-300 ease-linear",
      leaveActiveClass: "transition-opacity duration-300 ease-linear",
      mode: "out-in",
    },
  },

  runtimeConfig: {
    public: {
      apiBaseURL: process.env.NUXT_PUBLIC_API_BASE_URL ?? "",
    },
    downloadPath: process.env.NUXT_DOWNLOAD_PATH ?? "",
    dockerHost: process.env.NUXT_DOCKER_HOST ?? "",
    dockerPort: process.env.NUXT_DOCKER_PORT ?? "",
    dockerSocketPath: process.env.NUXT_DOCKER_SOCKET_PATH ?? "",
    postgresUrl: process.env.NUXT_POSTGRES_URL ?? "",
    meiliHost: process.env.NUXT_MEILI_HOST ?? "",
    meiliPort: process.env.NUXT_MEILI_PORT ?? "",
    meiliSearchKey: process.env.NUXT_MEILI_SEARCH_KEY ?? "",
    meiliApiKey: process.env.NUXT_MEILI_API_KEY ?? "",
    redisHost: process.env.NUXT_REDIS_HOST ?? "",
    redisPort: process.env.NUXT_REDIS_PORT ?? "",
    redisPassword: process.env.NUXT_REDIS_PASSWORD ?? "",
  },

  typescript: {
    tsConfig: {
      exclude: ["../src-tauri/**/*"],
    },
  },

  vite: {
    ssr: {
      noExternal: ["monaco-editor"],
    },
    optimizeDeps: {
      exclude: ["docker-modem"],
    },
  },

  imports: {
    dirs: ["stores"],
  },

  colorMode: {
    classSuffix: "",
  },

  lodash: {
    exclude: ["head", "uniqueId"],
  },

  devtools: {
    enabled: true,
  },
});
