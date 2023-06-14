import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { loadNuxtConfig } from "nuxt/kit";
import postgres from "postgres";

(async () => {
  const nuxtOptions = await loadNuxtConfig({});
  const config = nuxtOptions.runtimeConfig;
  const sql = postgres({
    host: config.postgresHost,
    port: parseInt(config.postgressPort) ?? 5432,
    username: config.postgresUsername,
    password: config.postgresPassword,
    database: config.postgresDatabase,
    max: 1,
  });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "./drizzle" });
  process.exit();
})();
