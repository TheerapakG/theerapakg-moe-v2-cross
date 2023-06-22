import { type } from "arktype";
import defu from "defu";
import { eq } from "drizzle-orm";
import fs from "fs";
import mime from "mime";
import path from "path";

const queryValidator = type({
  "page?": ["parsedInteger", "|>", type("integer>0")],
  "size?": ["parsedInteger", "|>", type("integer<=50")],
});

const paramValidator = type({
  user: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      query,
      param: { user: target },
    } = await validateEvent(
      { query: queryValidator, param: paramValidator },
      event
    );
    const { page, size } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    if (user !== target) {
      if (!(await checkUserPerm(user)).includes("file:list"))
        throw createError({ statusMessage: "no permission" });
    }

    const files = await useDrizzle()
      .select()
      .from(fileTable)
      .where(eq(fileTable.owner, target))
      .orderBy(fileTable.created)
      .offset(start)
      .limit(size);

    return {
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
