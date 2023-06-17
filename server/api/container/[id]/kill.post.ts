import { eq } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user, "container:manage")))
      throw createError({ statusMessage: "no permission" });

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    const _dockerId = await useDrizzle()
      .select({ dockerId: containerTable.dockerId })
      .from(containerTable)
      .where(eq(containerTable.id, id))
      .limit(1);

    const dockerId: string | undefined = _dockerId[0]?.dockerId;

    if (!dockerId)
      throw createError({ statusMessage: "no specified container" });

    await useDocker().getContainer(dockerId).kill();

    return {};
  })
);
