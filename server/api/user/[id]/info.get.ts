import { useRedis } from "~/server/utils/useRedis";
import { getSafeIdFromId } from "~/server/utils/getId";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const id = getSafeIdFromId(event.context.params.id as string);

    return {
      name: await useRedis().hget(`user:id:${id}`, "name"),
    };
  })
);
