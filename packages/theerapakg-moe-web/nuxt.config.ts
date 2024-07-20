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
      wsHost: process.env.NUXT_PUBLIC_WS_HOST ?? "",
      wsPort: process.env.NUXT_PUBLIC_WS_PORT ?? "",
      apiBaseURL: process.env.NUXT_PUBLIC_API_BASE_URL ?? "",
    },
    downloadPath: process.env.NUXT_DOWNLOAD_PATH ?? "",
    dockerSocketPath: process.env.NUXT_DOCKER_SOCKET_PATH ?? "",
    redisPort: process.env.NUXT_REDIS_PORT ?? "",
    dockerHost: process.env.NUXT_DOCKER_HOST ?? "",
    dockerPort: process.env.NUXT_DOCKER_PORT ?? "",
    meiliPort: process.env.NUXT_MEILI_PORT ?? "",
    meiliSearchKey: process.env.NUXT_MEILI_SEARCH_KEY ?? "",
    meiliApiKey: process.env.NUXT_MEILI_API_KEY ?? "",
    postgresHost: process.env.NUXT_POSTGRES_HOST ?? "",
    postgresPort: process.env.NUXT_POSTGRES_PORT ?? "",
    postgresUsername: process.env.NUXT_POSTGRES_USERNAME ?? "",
    postgresPassword: process.env.NUXT_POSTGRES_PASSWORD ?? "",
    postgresDatabase: process.env.NUXT_POSTGRES_DATABASE ?? "",
    postgresUrl: process.env.NUXT_POSTGRES_URL ?? "",
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
