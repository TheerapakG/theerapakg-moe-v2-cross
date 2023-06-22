import { type } from "arktype";
import { eq } from "drizzle-orm";

const paramValidator = type({
  id: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const {
      param: { id },
    } = await validateEvent({ param: paramValidator }, event);

    const _user = await useDrizzle()
      .select({
        id: userTable.id,
        name: userTable.name,
      })
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);

    const user: { id: string; name: string } | undefined = _user[0];

    return {
      name: user?.name,
    };
  })
);
