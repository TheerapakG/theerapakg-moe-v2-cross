import { Upload } from "@aws-sdk/lib-storage";
import { type } from "arktype";
import { eq } from "drizzle-orm";
import fetch from "node-fetch";
import { Readable } from "stream";

const paramValidator = type({
  id: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { id },
    } = await validateEvent({ param: paramValidator }, event);

    const [
      {
        perms: { edit },
      },
    ] = await checkFilesUserPerm([id], user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    const body = await readBody(event);
    if (!body.content) return;

    const _dir = await useDrizzle()
      .select({ dir: fileTable.dir })
      .from(fileTable)
      .where(eq(fileTable.id, id))
      .limit(1);

    const dir: string | undefined = _dir[0]?.dir;

    if (dir) {
      const fileBody = (await fetch(body.content)).body;

      if (fileBody === null)
        throw createError({
          statusCode: 500,
          statusMessage: "invalid file body",
        });

      const config = useRuntimeConfig();

      const upload = new Upload({
        client: useS3(),
        params: {
          Bucket: config.s3Bucket,
          Key: `files${dir}`,
          Body: new Readable().wrap(fileBody),
        },
      });

      await upload.done();

      const date = new Date();

      const [update] = await useDrizzle()
        .update(fileTable)
        .set({
          modified: date,
        })
        .where(eq(fileTable.id, id))
        .returning({
          id: fileTable.id,
          modified: fileTable.modified,
        });

      await useMeili(useRuntimeConfig().meiliApiKey)
        .index("files")
        .updateDocuments(
          [
            {
              id: update.id,
              modified: update.modified.getTime() / 1000,
            },
          ],
          { primaryKey: "id" },
        );

      return {};
    }
  }),
);
