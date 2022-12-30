import fs from "fs";
import mime from "mime";
import path from "path";
import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";
import { getSafeIdFromId, getSafeIdFromIdObject } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params.id as string);

    const { view, edit, owner } = await getFilePermForUser(`file:${id}`, user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const dir = await useRedis().hget(`file:${id}`, "dir");
    const viewPerm = await useRedis().zcount(
      `perms:file:${id}:view`,
      "-inf",
      "inf"
    );
    const editPerm = await useRedis().zcount(
      `perms:file:${id}:edit`,
      "-inf",
      "inf"
    );

    if (dir) {
      return {
        name: path.basename(dir),
        owner: getSafeIdFromIdObject<"user">(owner),
        perms: {
          user: {
            view,
            edit,
          },
          count: {
            view: viewPerm,
            edit: editPerm,
          },
        },
        size: (await fs.promises.stat(dir)).size,
        mime: mime.getType(dir) ?? "",
        url: `/api/file/${id}/download`,
      };
    }
  })
);
