import { type } from "arktype";
import { inArray } from "drizzle-orm";
import { keyBy as useKeyBy, isEmpty } from "lodash-es";
import mime from "mime";
import path from "path";

const queryValidator = type({
  ids: [
    type([
      "string",
      "|>",
      (s) =>
        s
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0),
    ]),
    "|>",
    type("0 <= uuid[] <= 50"),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      query: { ids },
    } = await validateEvent({ query: queryValidator }, event);

    const filePerms = await checkFilesUserPerm(ids, user);

    if (isEmpty(ids)) return [];

    const files = await useDrizzle()
      .select()
      .from(fileTable)
      .where(inArray(fileTable.id, ids));
    const fileMap = useKeyBy(files, "id");

    const config = useRuntimeConfig();

    return await Promise.all(
      ids.map(async (id, i) => {
        const file = fileMap[id];

        const info = await useS3().headObject({
          Bucket: config.s3Bucket,
          Key: `files${file.dir}`,
        });

        return {
          id,
          name: path.basename(file.name),
          owner: filePerms[i].owner,
          size: info.ContentLength,
          created: file.created,
          modified: file.modified,
          mime: mime.getType(file.name) ?? "",
          url: filePerms[i].perms.view
            ? `${config.s3DomainEndpoint}/files${file.dir}`
            : "",
        };
      }),
    );
  }),
);
