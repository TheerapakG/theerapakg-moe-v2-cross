import { type } from "arktype";
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let _drizzle: PostgresJsDatabase | undefined = undefined;

export const useDrizzle = () => {
  if (!_drizzle) {
    const config = useRuntimeConfig();
    const sql = postgres(
      `postgres://${config.postgresUsername}:${config.postgresPassword}@${config.postgresHost}:${type("number | parsedInteger")(config.postgresPort)?.data ?? 5432}/${config.postgresDatabase}`,
    );
    _drizzle = drizzle(sql);
  }

  return _drizzle;
};
