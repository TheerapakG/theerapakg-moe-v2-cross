import { eq, sql } from "drizzle-orm";
import fs from "fs";
import mime from "mime";
import { keyBy as useKeyBy } from "lodash-es";
import path from "path";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    const { owner, view, edit } = await checkFileUserPerm(id, user);

    const { _file, perms } = await useDrizzle().transaction(async (tx) => {
      const _file = await tx
        .select()
        .from(fileTable)
        .where(eq(fileTable.id, id))
        .limit(1);

      const perms = await tx
        .select({
          id: fileUserPermissionsTable.file_id,
          permission: fileUserPermissionsTable.permission,
          count: sql`count(*)`.as("count"),
        })
        .from(fileUserPermissionsTable)
        .where(eq(fileUserPermissionsTable.file_id, id))
        .groupBy(
          fileUserPermissionsTable.file_id,
          fileUserPermissionsTable.permission
        );

      return { _file, perms };
    });

    const file: (typeof _file)[number] | undefined = _file[0];
    const permMap = useKeyBy(perms, "permission");
    const viewCount = permMap["file!:view"]?.count;
    const editCount = permMap["file!:edit"]?.count;

    if (file) {
      return {
        name: path.basename(file.dir),
        owner,
        perms: {
          user: {
            view,
            edit,
          },
          count: {
            view: typeof viewCount == "string" ? parseInt(viewCount) : 0,
            edit: typeof editCount == "string" ? parseInt(editCount) : 0,
          },
        },
        size: (await fs.promises.stat(file.dir)).size,
        created: file.created,
        modified: file.modified,
        mime: mime.getType(file.dir) ?? "",
        url: `/api/file/${id}/download`,
      };
    }
  })
);
