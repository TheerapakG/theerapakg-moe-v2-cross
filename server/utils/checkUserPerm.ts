import { and, eq } from "drizzle-orm";

import {
  UserPermission,
  userPermissions as userPermissionsTable,
} from "~/schema/user_permission";

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
