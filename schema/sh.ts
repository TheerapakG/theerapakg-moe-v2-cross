import { InferModel } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const sh = pgTable("sh", {
  from: text("from").primaryKey(),
  to: text("to").notNull(),
});

export { sh as shTable };

export type ShInfo = InferModel<typeof sh>;
