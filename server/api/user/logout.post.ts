import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";

export default defineEventHandler(async (event) => {
  const user = await getUser(event);

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
