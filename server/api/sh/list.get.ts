import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { ShDocument, useMeili } from "~/server/utils/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);
    if ((await useRedis().sismember(`perms:${user}`, "perms:sh:list")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? _.min([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const shSearch = query.sh ? decodeURIComponent(query.sh as string) : "";

    const { estimatedTotalHits: queryCount, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<ShDocument>("shs")
      .search<ShDocument>(shSearch, {
        offset: start,
        limit: size,
      });

    const froms = _.map(hits, "name");
    const tos = _.map(hits, "to");

    return {
      totalCount: await useRedis().zcount("sh:ids", "-inf", "inf"),
      queryCount: queryCount ?? Infinity,
      sh: _.zipWith(froms, tos, (from, to) => {
        return { from, to };
      }),
    };
  })
);
