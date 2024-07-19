import { type } from "arktype";
import defu from "defu";
import { eq } from "drizzle-orm";

const queryValidator = type({
  "page?": ["parsedInteger", "|>", type("integer>0")],
  "size?": ["parsedInteger", "|>", type("integer<=50")],
});

const paramValidator = type({
  user: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      query,
      param: { user: target },
    } = await validateEvent(
      { query: queryValidator, param: paramValidator },
      event,
    );
    const { page, size } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    if (user !== target) {
      if (!(await checkUserPerm(user)).includes("container:list"))
        throw createError({ statusMessage: "no permission" });
    }

    const containers = await useDrizzle()
      .select()
      .from(containerTable)
      .where(eq(containerTable.owner, target))
      .offset(start)
      .limit(size);

    return {
      containers: await Promise.all(
        containers.map(async ({ id, owner, dockerId }) => {
          const {
            State: {
              Dead: dead,
              Paused: paused,
              Running: running,
              Status: status,
            },
          } = await useDocker().getContainer(dockerId).inspect();
          return {
            id,
            owner,
            state: {
              dead,
              paused,
              running,
              status,
            },
          };
        }),
      ),
    };
  }),
);
