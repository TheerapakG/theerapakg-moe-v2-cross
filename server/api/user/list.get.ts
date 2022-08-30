import _ from "lodash";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const query = useQuery(event);

  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  const page = query.page ? parseInt(query.page as string) : 1;
  const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
  const start = (page - 1) * size;
  const stop = start + size - 1;

  try {
    const ids = await useRedis().zrange("user:ids", start, stop);

    if (ids) {
      const [errs1, names] = _.zip(
        ...(await useRedis()
          .multi(ids.map((id) => ["hget", id, "name"]))
          .exec())
      ) as [Array<Error>, Array<string>];

      const strippedIds = ids.map((id) => id.split(":", 2)[1]);

      if (
        [errs1].every((errs) => errs?.every((e) => !e)) &&
        names?.every((e) => e)
      ) {
        const data = _.zipWith(strippedIds, names, (id, name) => {
          return {
            id,
            name,
          };
        });

        return {
          status: 0,
          value: {
            count: await useRedis().zcount("user:ids", "-inf", "inf"),
            users: data,
          },
        };
      }
    }
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
