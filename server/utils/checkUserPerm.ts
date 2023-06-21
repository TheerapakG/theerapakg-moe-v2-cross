import { eq } from "drizzle-orm";

export const checkUserPerm = async (user: string) => {
  return (
    await useDrizzle()
      .select({
        permission: userPermissionsTable.permission,
      })
      .from(userPermissionsTable)
      .where(eq(userPermissionsTable.user_id, user))
  ).map((perm) => perm.permission);
};
