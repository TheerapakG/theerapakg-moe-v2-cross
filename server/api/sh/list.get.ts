import { type } from "arktype";
import { defu } from "defu";
import { map as useMap, zipWith as useZipWith } from "lodash-es";

const queryValidator = type({
  "sh?": "string",
  "page?": ["parsedInteger", "|>", type("integer>0")],
  "size?": ["parsedInteger", "|>", type("integer<=50")],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("sh:list"))
      throw createError({ statusMessage: "no permission" });

    const { query } = await validateEvent({ query: queryValidator }, event);
    const { page, size, sh: target } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    const { estimatedTotalHits: count, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey,
    )
      .index<typeof shDocument>("shs")
      .search<typeof shDocument>(target, {
        offset: start,
        limit: size,
      });

    const froms = useMap(hits, "name");
    const tos = useMap(hits, "to");

    return {
      count: count ?? Infinity,
      sh: useZipWith(froms, tos, (from, to) => {
        return { from, to };
      }),
    };
  }),
);
