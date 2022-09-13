import fs from "fs";
import path from "path";
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

  if ((await useRedis().sismember(`${user}:perms`, "perms:file:list")) > 0) {
    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;
    try {
      const ids = await useRedis().zrange("file:ids", start, stop);

      if (ids) {
        const [errs1, files] = _.zip(
          ...(await useRedis()
            .multi(ids.map((id) => ["hgetall", id]))
            .exec())
        ) as [Array<Error>, Array<{ dir: string; owner: string }>];

        const [errs2, viewPerms] = _.zip(
          ...(await useRedis()
            .multi(
              ids.map((id) => ["zcount", `${id}:perms:view`, "-inf", "inf"])
            )
            .exec())
        ) as [Array<Error>, Array<string>];

        const [errs3, editPerms] = _.zip(
          ...(await useRedis()
            .multi(
              ids.map((id) => ["zcount", `${id}:perms:edit`, "-inf", "inf"])
            )
            .exec())
        ) as [Array<Error>, Array<string>];

        const strippedIds = ids.map(getIdFromIdObject);

        if (
          [errs1, errs2, errs3].every((errs) => errs?.every((e) => !e)) &&
          files?.every((e) => e) &&
          [viewPerms, editPerms].every((e) => e)
        ) {
          const data = await Promise.all(
            _.zipWith(
              strippedIds,
              files,
              viewPerms,
              editPerms,
              async (id, file, viewPerm, editPerm) => {
                return {
                  id,
                  name: path.basename(file.dir),
                  owner: getIdFromIdObject(file.owner),
                  perms: {
                    view: parseInt(viewPerm),
                    edit: parseInt(editPerm),
                  },
                  size: (await fs.promises.stat(file.dir)).size,
                  url: `/api/file/download/${id}`,
                };
              }
            )
          );

          return {
            status: 0,
            value: {
              count: await useRedis().zcount("file:ids", "-inf", "inf"),
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
