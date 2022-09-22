import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";
import { getSafeIdFromIdObject } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = useQuery(event);

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;

    const ids = await useRedis().zrange("user:ids", start, stop);
    if (!ids) return;

    const [errs, names] = _.zip(
      ...(await useRedis()
        .multi(ids.map((id) => ["hget", id, "name"]))
        .exec())
    ) as [Array<Error>, Array<string>];

    errs.forEach((e) => {
      if (e) throw e;
    });

    if (names.some((e) => !e)) return;

    const strippedIds = ids.map(getSafeIdFromIdObject<"user">);

    return {
      count: await useRedis().zcount("user:ids", "-inf", "inf"),
      users: _.zipWith(strippedIds, names, (id, name) => {
        return {
          id,
          name,
        };
      }),
    };
  })
);
