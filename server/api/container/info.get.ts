import { type } from "arktype";
import { inArray } from "drizzle-orm";

const queryValidator = type({
  ids: [
    type([
      "string",
      "|>",
      (s) =>
        s
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0),
    ]),
    "|>",
    type("0 <= uuid[] <= 50"),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("container:inspect"))
      throw createError({ statusMessage: "no permission" });

    const {
      query: { ids },
    } = await validateEvent({ query: queryValidator }, event);

    const dockerIds = await useDrizzle()
      .select({ id: containerTable.id, dockerId: containerTable.dockerId })
      .from(containerTable)
      .where(inArray(containerTable.id, ids));
    const dockerIdMap = useKeyBy(dockerIds, "id");

    return await Promise.all(
      ids.map(async (id) => {
        const { dockerId } = dockerIdMap[id];

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
          state: {
            dead,
            paused,
            running,
            status,
          },
        };
      })
    );
  })
);
