import { inArray, sql } from "drizzle-orm";
import fs from "fs";
import mime from "mime";
import {
  groupBy as useGroupBy,
  keyBy as useKeyBy,
  min as useMin,
} from "lodash-es";
import path from "path";

import { FileDocument } from "~/documents/file";

import { file as fileTable } from "~/schema/file";
import { fileUserPermissions as fileUserPermisionsTable } from "~/schema/file_permission";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    const perm = await checkUserPerm(user, "file:list");
    if (!perm) throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);

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

    const {
      count: totalCount,
      files,
      perms,
    } = await useDrizzle().transaction(async (tx) => {
      const [count] = await tx
        .select({
          count: sql<number>`count(*)`,
        })
        .from(fileTable);

      const files = await tx
        .select()
        .from(fileTable)
        .where(inArray(fileTable.id, ids))
        .orderBy(fileTable.created);

      const perms = await tx
        .select({
          id: fileUserPermisionsTable.file_id,
          permission: fileUserPermisionsTable.permission,
          count: sql`count(*)`.as("count"),
        })
        .from(fileUserPermisionsTable)
        .where(inArray(fileUserPermisionsTable.file_id, ids))
        .groupBy(
          fileUserPermisionsTable.file_id,
          fileUserPermisionsTable.permission
        );

      return { count, files, perms };
    });

    const filePermMap = useGroupBy(perms, "id");

    return {
      totalCount,
      queryCount: queryCount ?? Infinity,
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
