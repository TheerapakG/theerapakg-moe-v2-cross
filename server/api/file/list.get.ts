import fs from "fs";
import _ from "lodash";
import mime from "mime";
import path from "path";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getSafeIdFromIdObject } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { FileDocument, useMeili } from "~/server/utils/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);
    if ((await useRedis().sismember(`perms:${user}`, "perms:file:list")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? _.min([parseInt(query.size as string), 50]) ?? 10
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
        : (_.zip(
            ...(await Promise.all([
              (async () =>
                _.zip(
                  ...((await useRedis()
                    .multi(ids.map((id) => ["hgetall", `file:${id}`]))
                    .exec()) ?? [])
                ) as [
                  Error[],
                  { dir: string; owner: `user:id:${string}` }[]
                ])(),

              (async () =>
                _.zip(
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
                _.zip(
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
        _.zipWith(
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
                view: parseInt(viewPerm),
                edit: parseInt(editPerm),
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
