import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    if (user === "user:default") {
      throw createError({ statusMessage: "no permission" });
    }

    await useRedis().del(`session:${getCookie(event, "session_id")}`);

    deleteCookie(event, "session_id");

    return {};
  })
);
