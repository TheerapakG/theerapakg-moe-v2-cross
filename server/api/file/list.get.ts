import fs from "fs";
import path from "path";
import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getSafeIdFromIdObject } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = useQuery(event);
    const user = await getUser(event);
    if ((await useRedis().sismember(`${user}:perms`, "perms:file:list")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;
    const ids = await useRedis().zrange("file:ids", start, stop);

    if (!ids) return;

    const [errs, [files, viewPerms, editPerms]] = _.zip(
      ...(await Promise.all([
        (async () =>
          _.zip(
            ...(await useRedis()
              .multi(ids.map((id) => ["hgetall", id]))
              .exec())
          ) as [Error[], { dir: string; owner: `user:${string}` }[]])(),

        (async () =>
          _.zip(
            ...(await useRedis()
              .multi(
                ids.map((id) => ["zcount", `${id}:perms:view`, "-inf", "inf"])
              )
              .exec())
          ) as [Error[], string[]])(),

        (async () =>
          _.zip(
            ...(await useRedis()
              .multi(
                ids.map((id) => ["zcount", `${id}:perms:edit`, "-inf", "inf"])
              )
              .exec())
          ) as [Error[], string[]])(),
      ]))
    ) as [
      Error[][],
      [{ dir: string; owner: `user:${string}` }[], string[], string[]]
    ];

    const strippedIds = ids.map(getSafeIdFromIdObject<"file">);

    errs.forEach((err) =>
      err.forEach((e) => {
        if (e) throw e;
      })
    );

    if (!(files?.every((e) => e) && [viewPerms, editPerms].every((e) => e)))
      return;

    return {
      count: await useRedis().zcount("file:ids", "-inf", "inf"),
      files: await Promise.all(
        _.zipWith(
          strippedIds,
          files,
          viewPerms,
          editPerms,
          async (id, file, viewPerm, editPerm) => {
            return {
              id,
              name: path.basename(file.dir),
              owner: getSafeIdFromIdObject<"user">(file.owner),
              perms: {
                view: parseInt(viewPerm),
                edit: parseInt(editPerm),
              },
              size: (await fs.promises.stat(file.dir)).size,
              url: `/api/file/download/${id}`,
            };
          }
        )
      ),
    };
  })
);
