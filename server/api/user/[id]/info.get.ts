import { useRedis } from "~/utils/server/useRedis";
import { getSafeIdFromId } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const id = getSafeIdFromId(event.context.params?.id);

    return {
      name: await useRedis().hget(`user:id:${id}`, "name"),
    };
  })
);
