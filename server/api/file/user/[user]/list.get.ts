import fs from "fs";
import { min as useMin, zip as useZip, zipWith as useZipWith } from "lodash-es";
import path from "path";

import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { getSafeIdFromId, getSafeIdFromIdObject } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);

    const target = getSafeIdFromId(event.context.params?.user);
    if (
      user !== target &&
      (await useRedis().sismember(`perms:${user}`, "perms:file:list")) <= 0
    )
      throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;
    const ids = (await useRedis().zrange(
      `file:${target}:ids`,
      start,
      stop
    )) as `file:${string}`[];

    if (!ids) return;

    const [errs, [files, viewPerms, editPerms]] = useZip(
      ...(await Promise.all([
        (async () =>
          useZip(
            ...((await useRedis()
              .multi(ids.map((id) => ["hgetall", id]))
              .exec()) ?? [])
          ) as [Error[], { dir: string; owner: `user:id:${string}` }[]])(),

        (async () =>
          useZip(
            ...((await useRedis()
              .multi(
                ids.map((id) => ["zcount", `perms:${id}:view`, "-inf", "inf"])
              )
              .exec()) ?? [])
          ) as [Error[], string[]])(),

        (async () =>
          useZip(
            ...((await useRedis()
              .multi(
                ids.map((id) => ["zcount", `perms:${id}:edit`, "-inf", "inf"])
              )
              .exec()) ?? [])
          ) as [Error[], string[]])(),
      ]))
    ) as [
      Error[][],
      [{ dir: string; owner: `user:id:${string}` }[], string[], string[]]
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
        useZipWith(
          strippedIds,
          files,
          viewPerms,
          editPerms,
          async (id, file, viewPerm, editPerm) => {
            return {
              id,
              name: path.basename(file.dir),
              owner: getSafeIdFromIdObject<"user:id">(file.owner),
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
