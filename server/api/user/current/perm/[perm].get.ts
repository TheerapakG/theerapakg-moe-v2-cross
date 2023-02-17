import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }

    const user = await getUser(event);

    return {
      value:
        (await useRedis().sismember(
          `perms:${user}`,
          decodeURIComponent(event.context.params.perm)
        )) > 0,
    };
  })
);
