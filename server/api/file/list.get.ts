import fs from "fs";
import path from "path";
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

  if ((await useRedis().sismember(`${user}:perms`, "perms:file:list")) > 0) {
    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;
    try {
      const ids = await useRedis().zrange("file:ids", start, stop);

      if (ids) {
        const [errs, files] = _.zip(
          ...(await useRedis()
            .multi(ids.map((id) => ["hgetall", id]))
            .exec())
        ) as [Array<Error>, Array<{ dir: string; owner: string }>];

        const strippedIds = ids.map((id) => id.split(":", 2)[1]);

        if (errs?.every((e) => !e) && files?.every((e) => e)) {
          const data = await Promise.all(
            _.zipWith(strippedIds, files, async (id, file) => {
              return {
                id,
                name: path.basename(file.dir),
                owner: file.owner,
                size: (await fs.promises.stat(file.dir)).size,
                url: `/api/file/download/${id}`,
              };
            })
          );

          return {
            status: 0,
            value: {
              files: data,
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
