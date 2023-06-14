import { InferModel } from "drizzle-orm";
import {
  pgTable,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const container = pgTable(
  "container",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    owner: uuid("owner")
      .references(() => user.id)
      .notNull(),
    dockerId: varchar("docker_id", { length: 64 }).notNull(),
  },
  (table) => {
    return {
      ownerIdx: index("container_owner_idx").on(table.owner),
      dockerIdIdx: uniqueIndex("container_docker_id_idx").on(table.dockerId),
    };
  }
);
export type Container = InferModel<typeof container>;
