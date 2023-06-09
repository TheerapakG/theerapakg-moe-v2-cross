import { min as useMin, zip as useZip, zipWith as useZipWith } from "lodash-es";

import { useRedis } from "~/utils/server/useRedis";
import { getSafeIdFromIdObject } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;

    const ids = (await useRedis().zrange(
      "user:ids",
      start,
      stop
    )) as `user:id:${string}`[];
    if (!ids) return;

    const [errs, names] = useZip(
      ...((await useRedis()
        .multi(ids.map((id) => ["hget", id, "name"]))
        .exec()) ?? [])
    ) as [Array<Error>, Array<string>];

    errs.forEach((e) => {
      if (e) throw e;
    });

    if (names.some((e) => !e)) return;

    const strippedIds = ids.map(getSafeIdFromIdObject<"user:id">);

    return {
      count: await useRedis().zcount("user:ids", "-inf", "inf"),
      users: useZipWith(strippedIds, names, (id, name) => {
        return {
          id,
          name,
        };
      }),
    };
  })
);
