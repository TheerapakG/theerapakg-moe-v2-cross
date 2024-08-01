import { timestamp, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

export const file = pgTable(
  "file",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dir: text("dir").notNull(),
    name: text("name").notNull(),
    owner: uuid("owner")
      .references(() => user.id)
      .notNull(),
    created: timestamp("created", { withTimezone: true }).notNull(),
    modified: timestamp("modified", { withTimezone: true }).notNull(),
  },
  (table) => {
    return {
      ownerIdx: index("file_owner_idx").on(table.owner),
    };
  },
);

export { file as fileTable };

export type FileInfo = typeof file._.inferSelect;
