import { type } from "arktype";

const queryValidator = type({
  image: "string",
  cmd: [type(["string", "|>", type("json")]), "|>", type("string[]")],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("container:manage"))
      throw createError({ statusMessage: "no permission" });

    const {
      query: { image, cmd },
    } = await validateEvent({ query: queryValidator }, event);

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
