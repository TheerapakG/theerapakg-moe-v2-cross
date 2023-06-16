import { and, eq, inArray, sql } from "drizzle-orm";
import { keyBy as useKeyBy, min as useMin } from "lodash-es";

import { UserDocument } from "~/documents/user";

import {
  FilePermission,
  fileUserPermissions as fileUserPermisionsTable,
} from "~/schema/file_permission";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    await checkFileUserPerm(id, user);

    const _perm = event.context.params?.perm;
    if (!_perm) throw createError({ statusMessage: "invalid perm" });
    const perm = `file!:${_perm}`;

    const query = getQuery(event);

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const userSearch = query.user
      ? decodeURIComponent(query.user as string)
      : "";

    const { estimatedTotalHits: queryCount, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<UserDocument>("users")
      .search<UserDocument>(userSearch, {
        offset: start,
        limit: size,
        attributesToRetrieve: ["id"],
      });

    const users = hits.map((u) => u.id);

    const { count: totalCount, perms } = await useDrizzle().transaction(
      async (tx) => {
        const [count] = await tx
          .select({
            count: sql<number>`count(*)`,
          })
          .from(fileUserPermisionsTable)
          .where(
            and(
              eq(fileUserPermisionsTable.file_id, id),
              eq(
                fileUserPermisionsTable.permission,
                perm as (typeof FilePermission.enumValues)[number]
              )
            )
          );

        const perms = await tx
          .select()
          .from(fileUserPermisionsTable)
          .where(
            and(
              eq(fileUserPermisionsTable.file_id, id),
              eq(
                fileUserPermisionsTable.permission,
                perm as (typeof FilePermission.enumValues)[number]
              ),
              inArray(fileUserPermisionsTable.user_id, users)
            )
          );

        return { count, perms };
      }
    );

    const permsMap = useKeyBy(perms, "user_id");

    return {
      totalCount: totalCount.count,
      queryCount: queryCount ?? Infinity,
      users: users.map((id) => {
        return {
          id,
          perm: permsMap[id] ? true : false,
        };
      }),
    };
  })
);
