import { defineNuxtModule, addServerHandler } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    compatibility: {
      nuxt: "^3.0.0",
    },
  },
  async setup() {
    addServerHandler({
      route: "",
      middleware: true,
      lazy: false,
      handler: "~/modules/routeLogging/routeLoggingHandler.ts",
    });
  },
});
