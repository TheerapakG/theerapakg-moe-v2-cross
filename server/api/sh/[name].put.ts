import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { wrapHandler } from "~/server/utils/wrapHandler";
import { ShDocument, useMeili } from "~/server/utils/useMeili";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if ((event.context.params.name as string).includes(":")) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid name",
      });
    }

    const query = useQuery(event);
    const user = await getUser(event);
    if ((await useRedis().sismember(`perms:${user}`, "perms:sh:edit")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const to = decodeURIComponent(query.target as string);

    await useRedis()
      .multi()
      .set(`sh::${event.context.params.name}`, to)
      .zadd("sh:ids", 1, `sh::${event.context.params.name}`)
      .exec();

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<ShDocument>("shs")
      .addDocuments(
        [
          {
            name: event.context.params.name,
            to,
          },
        ],
        { primaryKey: "name" }
      );

    return {};
  })
);
