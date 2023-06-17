import { sql } from "drizzle-orm";
import { min as useMin } from "lodash-es";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const perm = await checkUserPerm(user, "container:list");
    if (!perm) throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);
    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const { count, containers } = await useDrizzle().transaction(async (tx) => {
      const [count] = await tx
        .select({
          count: sql<number>`count(*)`,
        })
        .from(containerTable);

      const containers = await tx
        .select()
        .from(containerTable)
        .offset(start)
        .limit(size);

      return { count, containers };
    });

    return {
      count: count.count,
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
        })
      ),
    };
  })
);
