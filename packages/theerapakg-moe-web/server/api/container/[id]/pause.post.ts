import { type } from "arktype";
import { eq } from "drizzle-orm";

const paramValidator = type({
  id: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("container:manage"))
      throw createError({ statusMessage: "no permission" });

    const {
      param: { id },
    } = await validateEvent({ param: paramValidator }, event);

    const _dockerId = await useDrizzle()
      .select({ dockerId: containerTable.dockerId })
      .from(containerTable)
      .where(eq(containerTable.id, id))
      .limit(1);

    const dockerId: string | undefined = _dockerId[0]?.dockerId;

    if (!dockerId)
      throw createError({ statusMessage: "no specified container" });

    await useDocker().getContainer(dockerId).pause();

    return {};
  }),
);
