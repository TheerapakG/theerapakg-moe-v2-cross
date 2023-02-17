import fs from "fs";
import path from "path";
import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { getSafeIdFromId, getSafeIdFromIdObject } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { getFilePermForUser } from "~/utils/server/getFilePermForUser";
import { useMeili } from "~/utils/server/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params?.id);
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
