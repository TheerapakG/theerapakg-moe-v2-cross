import { type } from "arktype";
import { inArray } from "drizzle-orm";
import fs from "fs";
import { keyBy as useKeyBy } from "lodash-es";
import mime from "mime";
import path from "path";

const queryValidator = type({
  ids: [
    type(["string", "|>", (s) => s.split(",")]),
    "|>",
    type("0 < uuid[] <= 50"),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      query: { ids },
    } = await validateEvent({ query: queryValidator }, event);

    const filePerms = await checkFilesUserPerm(ids, user);

    const files = await useDrizzle()
      .select()
      .from(fileTable)
      .where(inArray(fileTable.id, ids));
    const fileMap = useKeyBy(files, "id");

    return await Promise.all(
      ids.map(async (id, i) => {
        const file = fileMap[id];

        return {
          id,
          name: path.basename(file.dir),
          owner: filePerms[i].owner,
          size: (await fs.promises.stat(file.dir)).size,
          created: file.created,
          modified: file.modified,
          mime: mime.getType(file.dir) ?? "",
          url: `/api/file/${id}/download`,
        };
      })
    );
  })
);
