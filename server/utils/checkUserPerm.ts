import { and, eq } from "drizzle-orm";

export const checkUserPerm = async (
  user: string,
  perm: (typeof UserPermission.enumValues)[number]
) => {
  return (
    (
      await useDrizzle()
        .select()
        .from(userPermissionsTable)
        .where(
          and(
            eq(userPermissionsTable.user_id, user),
            eq(userPermissionsTable.permission, perm)
          )
        )
        .limit(1)
    ).length > 0
  );
};
