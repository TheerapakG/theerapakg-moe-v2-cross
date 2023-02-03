import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
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
