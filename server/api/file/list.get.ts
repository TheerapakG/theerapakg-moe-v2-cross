import fs from "fs";
import mime from "mime";
import { min as useMin, zip as useZip, zipWith as useZipWith } from "lodash-es";
import path from "path";

import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { getSafeIdFromIdObject } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { FileDocument, useMeili } from "~/utils/server/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);
    if ((await useRedis().sismember(`perms:${user}`, "perms:file:list")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const fileSearch = query.file
      ? decodeURIComponent(query.file as string)
      : "";

    const { estimatedTotalHits: queryCount, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<FileDocument>("files")
      .search<FileDocument>(fileSearch, {
        offset: start,
        limit: size,
        attributesToRetrieve: ["id"],
      });

    const ids = hits.map((f) => f.id);

    const [errs, [files, viewPerms, editPerms]] =
      ids.length <= 0
        ? [[], [[], [], []]]
        : (useZip(
            ...(await Promise.all([
              (async () =>
                useZip(
                  ...((await useRedis()
                    .multi(ids.map((id) => ["hgetall", `file:${id}`]))
                    .exec()) ?? [])
                ) as [
                  Error[],
                  { dir: string; owner: `user:id:${string}` }[]
                ])(),

              (async () =>
                useZip(
                  ...((await useRedis()
                    .multi(
                      ids.map((id) => [
                        "zcount",
                        `perms:file:${id}:view`,
                        "-inf",
                        "inf",
                      ])
                    )
                    .exec()) ?? [])
                ) as [Error[], string[]])(),

              (async () =>
                useZip(
                  ...((await useRedis()
                    .multi(
                      ids.map((id) => [
                        "zcount",
                        `perms:file:${id}:edit`,
                        "-inf",
                        "inf",
                      ])
                    )
                    .exec()) ?? [])
                ) as [Error[], string[]])(),
            ]))
          ) as [
            Error[][],
            [{ dir: string; owner: `user:id:${string}` }[], string[], string[]]
          ]);

    errs.forEach((err) =>
      err.forEach((e) => {
        if (e) throw e;
      })
    );

    if (!(files?.every((e) => e) && [viewPerms, editPerms].every((e) => e)))
      return;

    return {
      totalCount: await useRedis().zcount("file:ids", "-inf", "inf"),
      queryCount: queryCount ?? Infinity,
      files: await Promise.all(
        useZipWith(
          ids,
          files,
          viewPerms,
          editPerms,
          async (id, file, viewPerm, editPerm) => {
            return {
              id,
              name: path.basename(file.dir),
              owner: getSafeIdFromIdObject<"user:id">(file.owner),
              perms: {
                count: {
                  view: parseInt(viewPerm),
                  edit: parseInt(editPerm),
                },
              },
              size: (await fs.promises.stat(file.dir)).size,
              mime: mime.getType(file.dir) ?? "",
              url: `/api/file/download/${id}`,
            };
          }
        )
      ),
    };
  })
);
