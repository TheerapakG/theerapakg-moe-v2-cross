import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";

export default defineEventHandler(async (event) => {
  if ((event.context.params.name as string).includes(":")) {
    return {
      status: -1,
    };
  }

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
      .zrem("sh::ids", `sh:${event.context.params.name}`)
      .del(`sh:${event.context.params.name}`)
      .exec();

    return {
      status: 0,
    };
  } else {
    return {
      status: -8,
      error: "no permission",
    };
  }
});
