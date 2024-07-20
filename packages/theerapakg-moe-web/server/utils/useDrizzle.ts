import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let _drizzle: PostgresJsDatabase | undefined = undefined;

export const useDrizzle = () => {
  if (!_drizzle) {
    const config = useRuntimeConfig();
    const sql = postgres(config.postgresUrl);
    _drizzle = drizzle(sql);
  }

  return _drizzle;
};
