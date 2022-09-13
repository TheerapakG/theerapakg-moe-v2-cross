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
      value: {
        id: user.split(":", 2)[1],
        name: await useRedis().hget(user, "name"),
      },
    };
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
