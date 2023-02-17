import { useRedis } from "~/utils/server/useRedis";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }
    if (event.context.params.name?.includes(":")) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid name",
      });
    }
    return {
      value: await useRedis().get(`sh::${event.context.params.name}`),
    };
  })
);
