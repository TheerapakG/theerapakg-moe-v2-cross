import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";
import { getSafeIdFromId } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { useMeili, UserDocument } from "~/server/utils/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params.id as string);
    const perm = getSafeIdFromId(event.context.params.perm as string);

    const { view } = await getFilePermForUser(`file:${id}`, user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? _.min([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const userSearch = query.user
      ? decodeURIComponent(query.user as string)
      : "";

    const { estimatedTotalHits: queryCount, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<UserDocument>("users")
      .search<UserDocument>(userSearch, {
        offset: start,
        limit: size,
        attributesToRetrieve: ["id"],
      });

    const users = hits.map((u) => u.id);

    const [errs2, perms] =
      users.length <= 0
        ? [[], []]
        : (_.zip(
            ...((await useRedis()
              .multi(
                users.map((user) => [
                  "zscore",
                  `perms:file:${id}:${perm}`,
                  `user:id:${user}`,
                ])
              )
              .exec()) ?? [])
          ) as [Error[], string[]]);

    errs2.forEach((e) => {
      if (e) throw e;
    });

    return {
      totalCount: await useRedis().zcount(
        `perms:file:${id}:${perm}`,
        "-inf",
        "inf"
      ),
      queryCount,
      users: _.zipWith(users, perms, (user, perm) => {
        return {
          id: user,
          perm: parseInt(perm) > 0,
        };
      }),
    };
  })
);
