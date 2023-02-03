import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    if (user === "user:id:default") {
      throw createError({ statusMessage: "no permission" });
    }

    await useRedis().del(`session:${getCookie(event, "session_id")}`);

    deleteCookie(event, "session_id");

    return {};
  })
);
