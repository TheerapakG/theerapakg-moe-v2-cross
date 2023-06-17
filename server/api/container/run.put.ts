import z from "zod";

const Cmd = z.string().array();

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user, "container:manage")))
      throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);

    const image = decodeURIComponent(query.image as string);
    const cmd = Cmd.parse(JSON.parse(decodeURIComponent(query.cmd as string)));

    const id = await createContainer(user, {
      Image: image,
      Cmd: cmd,
      Tty: false,
    });

    return {
      container: id,
    };
  })
);
