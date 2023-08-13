import { type } from "arktype";
import { sql, inArray } from "drizzle-orm";
import { isEqual, isEmpty } from "lodash-es";

const paramValidator = type({
  "users?": [
    type([
      "string",
      "|>",
      (s) =>
        s
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0),
    ]),
    "|>",
    type("0 <= uuid[] <= 50"),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { users: targets },
    } = await validateEvent({ param: paramValidator }, event);

    if (!isEqual(targets, [user])) {
      if (!(await checkUserPerm(user)).includes("file:list"))
        throw createError({ statusMessage: "no permission" });
    }

    if (!targets) {
      const [{ count }] = await useDrizzle()
        .select({ count: sql<number>`count(*)` })
        .from(fileTable);

      return { count };
    } else if (isEmpty(targets)) {
      return { count: 0 };
    } else {
      const [{ count: _count }] = await useDrizzle()
        .select({
          count: sql`count(*)`,
        })
        .from(fileTable)
        .where(inArray(fileTable.owner, targets));

      return { count: typeof _count === "string" ? parseInt(_count) : 0 };
    }
  }),
);
