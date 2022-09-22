import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    return {
      value:
        (await useRedis().sismember(
          `${user}:perms`,
          decodeURIComponent(event.context.params.perm)
        )) > 0,
    };
  })
);
