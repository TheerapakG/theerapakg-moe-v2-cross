import { sql } from "drizzle-orm";
import { map as useMap, min as useMin, zipWith as useZipWith } from "lodash-es";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    const perm = await checkUserPerm(user, "sh:list");
    if (!perm) throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const shSearch = query.sh ? decodeURIComponent(query.sh as string) : "";

    const [{ count: totalCount }] = await useDrizzle()
      .select({ count: sql<number>`count(*)` })
      .from(shTable);

    const { estimatedTotalHits: queryCount, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<typeof shDocument>("shs")
      .search<typeof shDocument>(shSearch, {
        offset: start,
        limit: size,
      });

    const froms = useMap(hits, "name");
    const tos = useMap(hits, "to");

    return {
      totalCount,
      queryCount: queryCount ?? Infinity,
      sh: useZipWith(froms, tos, (from, to) => {
        return { from, to };
      }),
    };
  })
);
