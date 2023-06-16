import { ShDocument } from "~/documents/sh";

import { sh as shTable } from "~/schema/sh";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    const perm = await checkUserPerm(user, "sh:edit");
    if (!perm) throw createError({ statusMessage: "no permission" });

    const query = getQuery(event);

    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }

    const to = decodeURIComponent(query.target as string);

    const [insert] = await useDrizzle()
      .insert(shTable)
      .values({
        from: event.context.params.name,
        to,
      })
      .onConflictDoUpdate({
        target: shTable.from,
        set: { to },
      })
      .returning({
        name: shTable.from,
        to: shTable.to,
      });

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<ShDocument>("shs")
      .addDocuments([insert], { primaryKey: "name" });

    return {};
  })
);
