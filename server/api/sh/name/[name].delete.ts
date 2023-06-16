import { eq } from "drizzle-orm";

import { ShDocument } from "~/documents/sh";

import { sh as shTable } from "~/schema/sh";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    const perm = await checkUserPerm(user, "sh:edit");
    if (!perm) throw createError({ statusMessage: "no permission" });

    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }

    await useMeili(useRuntimeConfig().meiliApiKey)
      .index<ShDocument>("shs")
      .deleteDocument(event.context.params.name);

    await useDrizzle()
      .delete(shTable)
      .where(eq(shTable.from, event.context.params.name));

    return {};
  })
);
