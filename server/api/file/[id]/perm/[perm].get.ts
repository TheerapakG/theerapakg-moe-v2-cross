import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";
import { getSafeIdFromId, getSafeIdFromIdObject } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = useQuery(event);
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params.id as string);
    const perm = getSafeIdFromId(event.context.params.perm as string);

    const { view } = await getFilePermForUser(`file:${id}`, user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;

    const [errs1, [count, userCount, users]] = _.zip(
      ...(await useRedis()
        .multi()
        .zcount(`perms:file:${id}:${perm}`, "-inf", "inf")
        .zcount("user:ids", "-inf", "inf")
        .zrange("user:ids", start, stop)
        .exec())
    ) as [Error[], [number, number, `user:${string}`[]]];

    errs1.forEach((e) => {
      if (e) throw e;
    });

    const [errs2, perms] = _.zip(
      ...(await useRedis()
        .multi(
          users.map((user) => ["zscore", `perms:file:${id}:${perm}`, user])
        )
        .exec())
    ) as [Error[], string[]];

    errs2.forEach((e) => {
      if (e) throw e;
    });

    return {
      count,
      userCount,
      users: _.zipWith(users, perms, (user, perm) => {
        return {
          id: getSafeIdFromIdObject<"user">(user),
          perm: parseInt(perm) > 0,
        };
      }),
    };
  })
);
