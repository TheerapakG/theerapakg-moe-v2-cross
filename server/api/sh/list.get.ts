import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getSafeIdFromIdObject } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = useQuery(event);
    const user = await getUser(event);
    if ((await useRedis().sismember(`${user}:perms`, "perms:sh:list")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;
    const froms = await useRedis().zrange("sh::ids", start, stop);
    if (!froms) return;

    const [errs, tos] = _.zip(
      ...(await useRedis()
        .multi(froms.map((from) => ["get", from]))
        .exec())
    ) as [Error[], string[]];

    errs.forEach((e) => {
      if (e) throw e;
    });

    return {
      count: await useRedis().zcount("sh::ids", "-inf", "inf"),
      sh: _.zipWith(froms.map(getSafeIdFromIdObject<"sh">), tos, (from, to) => {
        return { from, to };
      }),
    };
  })
);
