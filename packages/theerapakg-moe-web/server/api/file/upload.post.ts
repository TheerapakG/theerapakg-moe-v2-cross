import { type } from "arktype";
import crypto from "crypto";
import fetch from "node-fetch";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

const bodyValidator = type({
  file: "string",
  content: "string",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("file:edit"))
      throw createError({ statusMessage: "no permission" });

    const {
      body: { file, content },
    } = await validateEvent({ body: bodyValidator }, event);

    const { name, dir } = getFileName(user, file);

    const fileBody = (await fetch(content)).body;

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

    const [insert] = await useDrizzle()
      .insert(fileTable)
      .values({
        name,
        dir,
        owner: user,
        created: date,
        modified: date,
      })
      .returning();

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<typeof fileDocument>("files")
      .addDocuments(
        [
          {
            id: insert.id as ReturnType<typeof crypto.randomUUID>,
            name: insert.name,
            owner: insert.owner as ReturnType<typeof crypto.randomUUID>,
            created: insert.created.getTime() / 1000,
            modified: insert.modified.getTime() / 1000,
          },
        ],
        { primaryKey: "id" },
      );

    return { id: insert.id };
  }),
);
