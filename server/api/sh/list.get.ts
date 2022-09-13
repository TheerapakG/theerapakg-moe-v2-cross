import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getIdFromIdObject } from "~/server/utils/getId";

export default defineEventHandler(async (event) => {
  const query = useQuery(event);
  const user = await getUser(event);

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  if ((await useRedis().sismember(`${user}:perms`, "perms:sh:list")) > 0) {
    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;
    try {
      const froms = await useRedis().zrange("sh::ids", start, stop);

      if (froms) {
        const [errs, tos] = _.zip(
          ...(await useRedis()
            .multi(froms.map((from) => ["get", from]))
            .exec())
        ) as [Error[], string[]];

        if (errs.every((e) => !e)) {
          return {
            status: 0,
            value: {
              count: await useRedis().zcount("sh::ids", "-inf", "inf"),
              sh: _.zipWith(froms.map(getIdFromIdObject), tos, (from, to) => {
                return { from, to };
              }),
            },
          };
        }
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    return {
      status: -8,
      error: "no permission",
    };
  }

  return {
    status: -1,
  };
});
