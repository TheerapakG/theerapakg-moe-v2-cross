import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";

export default defineEventHandler(async (event) => {
  const user = await getUser(event);

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  try {
    return {
      status: 0,
      value:
        (await useRedis().sismember(
          `${user}:perms`,
          decodeURIComponent(event.context.params.perm)
        )) > 0,
    };
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
