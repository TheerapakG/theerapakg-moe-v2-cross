import { InferModel } from "drizzle-orm";
import { pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phash: varchar("phash", { length: 256 }),
  },
  (table) => {
    return {
      nameIdx: uniqueIndex("user_name_idx").on(table.name),
    };
  }
);

export type User = InferModel<typeof user>;
