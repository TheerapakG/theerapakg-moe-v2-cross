import { type } from "arktype";
import { defu } from "defu";

const queryValidator = type({
  "user?": "string",
  "page?": ["parsedInteger", "|>", type("integer>0")],
  "size?": ["parsedInteger", "|>", type("integer<=50")],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const { query } = await validateEvent({ query: queryValidator }, event);
    const { page, size, user: target } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    const { estimatedTotalHits: count, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<typeof userDocument>("users")
      .search<typeof userDocument>(target, {
        offset: start,
        limit: size,
        attributesToRetrieve: ["id"],
      });

    const users = hits.map((u) => u.id);

    return {
      count: count ?? Infinity,
      users,
    };
  })
);
