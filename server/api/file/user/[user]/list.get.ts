import { eq, sql } from "drizzle-orm";
import fs from "fs";
import mime from "mime";
import {
  groupBy as useGroupBy,
  keyBy as useKeyBy,
  min as useMin,
} from "lodash-es";
import path from "path";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const target = event.context.params?.user;

    if (user !== target) {
      const perm = await checkUserPerm(user, "file:list");
      if (!perm) throw createError({ statusMessage: "no permission" });
    }

    if (!target) throw createError({ statusMessage: "invalid user" });

    const query = getQuery(event);
    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const { count, files, perms } = await useDrizzle().transaction(
      async (tx) => {
        const [count] = await tx
          .select({
            count: sql<number>`count(*)`,
          })
          .from(fileTable)
          .where(eq(fileTable.owner, target));

        const _files = tx
          .$with("_files")
          .as(
            tx
              .select()
              .from(fileTable)
              .where(eq(fileTable.owner, target))
              .orderBy(fileTable.created)
              .offset(start)
              .limit(size)
          );

        const files = await tx.with(_files).select().from(_files);

        const perms = await tx
          .with(_files)
          .select({
            id: fileUserPermissionsTable.file_id,
            permission: fileUserPermissionsTable.permission,
            count: sql`count(*)`.as("count"),
          })
          .from(fileUserPermissionsTable)
          .innerJoin(_files, eq(fileUserPermissionsTable.file_id, _files.id))
          .groupBy(
            fileUserPermissionsTable.file_id,
            fileUserPermissionsTable.permission
          );

        return { count, files, perms };
      }
    );

    const filePermMap = useGroupBy(perms, "id");

    return {
      count,
      files: await Promise.all(
        files.map(async ({ id, dir, owner, created, modified }) => {
          const permMap = useKeyBy(filePermMap[id], "permission");
          const viewCount = permMap["file!:view"]?.count;
          const editCount = permMap["file!:edit"]?.count;
          return {
            id,
            name: path.basename(dir),
            owner,
            perms: {
              count: {
                view: typeof viewCount == "string" ? parseInt(viewCount) : 0,
                edit: typeof editCount == "string" ? parseInt(editCount) : 0,
              },
            },
            size: (await fs.promises.stat(dir)).size,
            created,
            modified,
            mime: mime.getType(dir) ?? "",
            url: `/api/file/download/${id}`,
          };
        })
      ),
    };
  })
);
