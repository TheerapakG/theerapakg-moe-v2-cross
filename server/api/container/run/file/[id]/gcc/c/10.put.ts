import { eq } from "drizzle-orm";

import { file as fileTable } from "~/schema/file";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user, "container:manage")))
      throw createError({ statusMessage: "no permission" });

    const fileId = event.context.params?.id;
    if (!fileId) throw createError({ statusMessage: "invalid id" });

    const { view } = await checkFileUserPerm(fileId, user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const _dir = await useDrizzle()
      .select({ dir: fileTable.dir })
      .from(fileTable)
      .where(eq(fileTable.id, fileId))
      .limit(1);

    const dir: string | undefined = _dir[0]?.dir;

    const id = createContainer(user, {
      Image: "gcc:10",
      Cmd: ["/bin/bash", "-c", "gcc /app/app.c -o /app/app; /app/app"],
      Volumes: {
        "/app/app.c": {},
      },
      HostConfig: {
        Binds: [`${dir}:/app/app.c:ro`],
      },
      WorkingDir: "/app",
      Tty: false,
    });

    return {
      container: id,
    };
  })
);
