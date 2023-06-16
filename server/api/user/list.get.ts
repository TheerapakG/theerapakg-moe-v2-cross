import { sql } from "drizzle-orm";
import { min as useMin } from "lodash-es";

import { user as userTable } from "~/schema/user";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    return await useDrizzle().transaction(async (tx) => {
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(userTable);

      const users = await tx
        .select({
          id: userTable.id,
          name: userTable.name,
        })
        .from(userTable)
        .offset(start)
        .limit(size);

      return { count, users };
    });
  })
);
