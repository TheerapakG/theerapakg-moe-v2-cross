import { eq } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("container:manage"))
      throw createError({ statusMessage: "no permission" });

    const fileId = event.context.params?.id;
    if (!fileId) throw createError({ statusMessage: "invalid id" });

    const {
      perms: { view },
    } = await checkFileUserPerm(fileId, user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const _dir = await useDrizzle()
      .select({ dir: fileTable.dir })
      .from(fileTable)
      .where(eq(fileTable.id, fileId))
      .limit(1);

    const dir: string | undefined = _dir[0]?.dir;

    const id = await createContainer(user, {
      Image: "python:3.10",
      Cmd: ["python3", "/app/app.py"],
      Volumes: {
        "/app/app.py": {},
      },
      HostConfig: {
        Binds: [`${dir}:/app/app.py:ro`],
      },
      WorkingDir: "/app",
      Tty: false,
    });

    return {
      container: id,
    };
  })
);
