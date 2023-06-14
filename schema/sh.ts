import { InferModel } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const sh = pgTable("sh", {
  from: text("from").primaryKey(),
  to: text("to").notNull(),
});
export type Sh = InferModel<typeof sh>;
