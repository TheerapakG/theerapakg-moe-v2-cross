import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

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
