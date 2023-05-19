import path from "path";
import { defineNuxtModule } from "@nuxt/kit";
import defu from "defu";

export default defineNuxtModule({
  meta: {
    compatibility: {
      nuxt: "^3.0.0-rc",
    },
  },
  async setup(_options, nuxt) {
    nuxt.options.nitro = defu(
      {
        plugins: [path.resolve("./modules/trpc/trpcNitroPlugin")],
      },
      nuxt.options.nitro
    );
  },
});
