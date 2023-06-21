import { inArray } from "drizzle-orm";
import fs from "fs";
import mime from "mime";
import { min as useMin } from "lodash-es";
import path from "path";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("file:list"))
      throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const fileSearch = query.file
      ? decodeURIComponent(query.file as string)
      : "";

    const { estimatedTotalHits: count, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<typeof fileDocument>("files")
      .search<typeof fileDocument>(fileSearch, {
        offset: start,
        limit: size,
        attributesToRetrieve: ["id"],
      });

    const ids = hits.map((f) => f.id);

    const files = await useDrizzle()
      .select()
      .from(fileTable)
      .where(inArray(fileTable.id, ids))
      .orderBy(fileTable.created);

    return {
      count: count ?? Infinity,
      files: await Promise.all(
        files.map(async ({ id, dir, owner, created, modified }) => {
          return {
            id,
            name: path.basename(dir),
            owner,
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
