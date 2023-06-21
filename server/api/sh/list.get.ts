import { map as useMap, min as useMin, zipWith as useZipWith } from "lodash-es";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("sh:list"))
      throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const shSearch = query.sh ? decodeURIComponent(query.sh as string) : "";

    const { estimatedTotalHits: count, hits } = await useMeili(
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
      count: count ?? Infinity,
      sh: useZipWith(froms, tos, (from, to) => {
        return { from, to };
      }),
    };
  })
);
