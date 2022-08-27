import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  if (!user || user === "user:default") {
    return {
      status: -8,
      error: "no permission",
    };
  }

  try {
    await useRedis().del(`session:${getCookie(event, "session_id")}`);

    deleteCookie(event, "session_id");

    return {
      status: 0,
    };
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
