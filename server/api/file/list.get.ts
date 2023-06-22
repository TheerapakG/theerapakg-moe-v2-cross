import { type } from "arktype";
import defu from "defu";
import { inArray } from "drizzle-orm";
import fs from "fs";
import mime from "mime";
import path from "path";

const queryValidator = type({
  "file?": "string",
  "page?": ["parsedInteger", "|>", type("integer>0")],
  "size?": ["parsedInteger", "|>", type("integer<=50")],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("file:list"))
      throw createError({ statusMessage: "no permission" });

    const { query } = await validateEvent({ query: queryValidator }, event);
    const { page, size, file: target } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    const { estimatedTotalHits: count, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<typeof fileDocument>("files")
      .search<typeof fileDocument>(target, {
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
