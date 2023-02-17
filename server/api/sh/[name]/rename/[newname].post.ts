import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { ShDocument, useMeili } from "~/utils/server/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }
    if (
      event.context.params.name.includes(":") ||
      event.context.params.newname.includes(":")
    ) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid name",
      });
    }

    const user = await getUser(event);
    if ((await useRedis().sismember(`perms:${user}`, "perms:sh:edit")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const to = await useRedis().get(`sh::${event.context.params.name}`);
    if (!to)
      throw createError({
        statusCode: 500,
        statusMessage: "invalid name",
      });

    await useRedis()
      .multi()
      .zrem("sh:ids", `sh::${event.context.params.name}`)
      .zadd("sh:ids", 1, `sh::${event.context.params.newname}`)
      .rename(
        `sh::${event.context.params.name}`,
        `sh::${event.context.params.newname}`
      )
      .exec();

    const index = useMeili(useRuntimeConfig().meiliApiKey).index<ShDocument>(
      "shs"
    );
    index.addDocuments(
      [
        {
          name: event.context.params.newname,
          to,
        },
      ],
      { primaryKey: "name" }
    );
    index.deleteDocument(event.context.params.name);

    return {};
  })
);
