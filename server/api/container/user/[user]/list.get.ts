import _ from "lodash";
import { useRedis } from "~/utils/server/useRedis";
import { getSafeIdFromId, getSafeIdFromIdObject } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { getUser } from "~/utils/server/getUser";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);

    const target = getSafeIdFromId(event.context.params.user);
    if (
      user !== target &&
      (await useRedis().sismember(`perms:${user}`, "perms:file:list")) <= 0
    )
      throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? _.min([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;

    const ids = (await useRedis().zrange(
      `container:${target}:ids`,
      start,
      stop
    )) as `container:${string}`[];

    const [errs, owners] = _.zip(
      ...((await useRedis()
        .multi(ids.map((id) => ["hget", id, "owner"]))
        .exec()) ?? [])
    ) as [Error[], `user:id:${string}`[]];

    errs.forEach((e) => {
      if (e) throw e;
    });

    if (owners.some((e) => !e)) return;

    const strippedIds = ids.map(getSafeIdFromIdObject<"container">);

    return {
      count: await useRedis().zcount("container:ids", "-inf", "inf"),
      users: _.zipWith(strippedIds, owners, (id, owner) => {
        return {
          id,
          owner,
        };
      }),
    };
  })
);
