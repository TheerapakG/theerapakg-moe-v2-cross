import { useRedis } from "~/server/utils/useRedis";
import { wrapHandler } from "~/server/utils/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if ((event.context.params.name as string).includes(":")) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid name",
      });
    }
    return {
      value: await useRedis().get(`sh:${event.context.params.name}`),
    };
  })
);
