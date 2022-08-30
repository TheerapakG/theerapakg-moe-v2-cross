import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  const id = (event.context.params.id as string).split(":", 2)[0];

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
        name: await useRedis().hget(`user:${id}`, "name"),
      },
    };
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
