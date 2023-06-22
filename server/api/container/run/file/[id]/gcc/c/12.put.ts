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
      param: { id: fileId },
    } = await validateEvent({ param: paramValidator }, event);

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
      Image: "gcc:12",
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
