import fs from "fs";
import path from "path";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getSafeIdFromId, getSafeIdFromIdObject } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";
import { useMeili } from "~/server/utils/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params.id as string);
    const name = decodeURIComponent(query.name as string);
    if (!name)
      throw createError({
        statusCode: 500,
        statusMessage: "invalid file name",
      });

    const base = path.resolve(
      useRuntimeConfig().downloadPath ?? "./.dist/files",
      `./${getSafeIdFromIdObject<"user:id">(user)}`
    );
    const dir = path.resolve(base, name);
    const relative = path.relative(base, dir);

    if (!(relative && !relative.startsWith("..") && !path.isAbsolute(relative)))
      throw createError({
        statusCode: 500,
        statusMessage: "invalid file name",
      });

    const { edit } = await getFilePermForUser(`file:${id}`, user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    const olddir = await useRedis().hget(`file:${id}`, "dir");
    if (olddir) {
      await fs.promises.mkdir(base, { recursive: true });
      await fs.promises.rename(olddir, dir);

      await useRedis().hset(`file:${id}`, "dir", dir);

      await useMeili(useRuntimeConfig().meiliApiKey)
        .index("files")
        .addDocuments(
          [
            {
              id,
              name: path.basename(dir),
              owner: getSafeIdFromIdObject<"user:id">(user),
            },
          ],
          { primaryKey: "id" }
        );

      return {};
    }
  })
);
