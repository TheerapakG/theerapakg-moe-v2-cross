import { type } from "arktype";
import { eq } from "drizzle-orm";

const paramValidator = type({
  name: [
    type(["string", "|>", (s) => decodeURIComponent(s)]),
    "|>",
    type(/^\w+$/),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const {
      param: { name },
    } = await validateEvent({ param: paramValidator }, event);

    const _value = await useDrizzle()
      .select({ to: shTable.to })
      .from(shTable)
      .where(eq(shTable.from, name))
      .limit(1);

    const value: { to: string } | undefined = _value[0];

    return { value: value?.to };
  })
);
