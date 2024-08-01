import { type } from "arktype";
import { eq } from "drizzle-orm";

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

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<typeof fileDocument>("files")
      .deleteDocument(id);

    const [{ dir }] = await useDrizzle()
      .delete(fileTable)
      .where(eq(fileTable.id, id))
      .returning({ dir: fileTable.dir });

    const config = useRuntimeConfig();

    await useS3().deleteObject({
      Bucket: config.s3Bucket,
      Key: `files${dir}`,
    });

    return {};
  }),
);
