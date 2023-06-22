import { type } from "arktype";
import { defu } from "defu";

const queryValidator = type({
  "page?": ["parsedInteger", "|>", type("integer>0")],
  "size?": ["parsedInteger", "|>", type("integer<=50")],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const { query } = await validateEvent({ query: queryValidator }, event);
    const { page, size } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    const users = await useDrizzle()
      .select({
        id: userTable.id,
        name: userTable.name,
      })
      .from(userTable)
      .offset(start)
      .limit(size);

    return { users };
  })
);
