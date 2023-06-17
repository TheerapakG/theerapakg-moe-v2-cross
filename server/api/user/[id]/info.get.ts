import { eq } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const id = event.context.params?.id;

    if (id) {
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
    }
  })
);
