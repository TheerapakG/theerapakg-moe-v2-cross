import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if ((event.context.params.name as string).includes(":")) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid name",
      });
    }

    const query = useQuery(event);
    const user = await getUser(event);
    if ((await useRedis().sismember(`${user}:perms`, "perms:sh:edit")) <= 0)
      throw createError({ statusMessage: "no permission" });

    await useRedis()
      .multi()
      .set(
        `sh:${event.context.params.name}`,
        decodeURIComponent(query.target as string)
      )
      .zadd("sh::ids", 1, `sh:${event.context.params.name}`)
      .exec();

    return {
      value: await useRedis().get(`sh:${event.context.params.name}`),
    };
  })
);
