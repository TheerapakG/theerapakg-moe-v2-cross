import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { getSafeIdFromIdObject } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    return {
      id: getSafeIdFromIdObject<"user:id">(user),
      name: await useRedis().hget(user, "name"),
    };
  })
);
