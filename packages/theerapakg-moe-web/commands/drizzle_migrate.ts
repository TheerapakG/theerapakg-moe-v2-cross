import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { loadNuxtConfig } from "@nuxt/kit";
import postgres from "postgres";
import { type } from "arktype";

(async () => {
  const nuxtOptions = await loadNuxtConfig({});
  const config = nuxtOptions.runtimeConfig;
  const sql = postgres(type("string")(config.postgresUrl)?.data ?? "", {
    max: 1,
  });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "./drizzle" });
  process.exit();
})();
