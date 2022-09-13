import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";

export default defineEventHandler(async (event) => {
  const query = useQuery(event);
  const user = await getUser(event);

  const id = (event.context.params.id as string).split(":", 2)[0];
  const perm = (event.context.params.perm as string).split(":", 2)[0];

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  try {
    const { view } = await getFilePermForUser(`file:${id}`, user);

    if (view) {
      const page = query.page ? parseInt(query.page as string) : 1;
      const size = query.size
        ? _.min([parseInt(query.size as string), 50])
        : 10;
      const start = (page - 1) * size;
      const stop = start + size - 1;

      const [errs, [count, userCount, users]] = _.zip(
        ...(await useRedis()
          .multi()
          .zcount(`file:${id}:perms:${perm}`, "-inf", "inf")
          .zcount("user:ids", "-inf", "inf")
          .zrange("user:ids", start, stop)
          .exec())
      ) as [Array<Error>, [number, number, string[]]];

      if (errs.every((e) => !e)) {
        const [errs, perms] = _.zip(
          ...(await useRedis()
            .multi(
              users.map((user) => ["zscore", `file:${id}:perms:${perm}`, user])
            )
            .exec())
        ) as [Array<Error>, Array<string>];

        if (errs.every((e) => !e)) {
          return {
            status: 0,
            value: {
              count,
              userCount,
              users: _.zipWith(users, perms, (user, perm) => {
                return {
                  id: user.split(":", 2)[1],
                  perm: parseInt(perm) > 0,
                };
              }),
            },
          };
        }
      }
    } else {
      return {
        status: -8,
        error: "no permission",
      };
    }
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
