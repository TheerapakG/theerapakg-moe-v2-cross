import { eq } from "drizzle-orm";

import { sh as shTable } from "~/schema/sh";

export default defineEventHandler(
  wrapHandler(async (event) => {
    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }

    const _value = await useDrizzle()
      .select({ to: shTable.to })
      .from(shTable)
      .where(eq(shTable.from, event.context.params.name))
      .limit(1);

    const value: { to: string } | undefined = _value[0];

    return { value: value?.to };
  })
);
