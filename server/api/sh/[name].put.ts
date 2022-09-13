import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";

export default defineEventHandler(async (event) => {
  if ((event.context.params.name as string).includes(":")) {
    return {
      status: -1,
    };
  }

  const query = useQuery(event);
  const user = await getUser(event);

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  if ((await useRedis().sismember(`${user}:perms`, "perms:sh:edit")) > 0) {
    await useRedis()
      .multi()
      .set(
        `sh:${event.context.params.name}`,
        decodeURIComponent(query.target as string)
      )
      .zadd("sh::ids", 1, `sh:${event.context.params.name}`)
      .exec();

    return {
      status: 0,
      value: await useRedis().get(`sh:${event.context.params.name}`),
    };
  } else {
    return {
      status: -8,
      error: "no permission",
    };
  }
});
