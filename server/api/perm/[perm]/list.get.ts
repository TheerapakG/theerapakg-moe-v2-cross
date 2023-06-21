import { and, eq, inArray } from "drizzle-orm";
import { keyBy as useKeyBy, min as useMin } from "lodash-es";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("perm:list"))
      throw createError({ statusMessage: "no permission" });

    const perm = event.context.params?.perm;
    if (!perm) throw createError({ statusMessage: "invalid perm" });

    const query = getQuery(event);

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? useMin([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;

    const userSearch = query.user
      ? decodeURIComponent(query.user as string)
      : "";

    const { estimatedTotalHits: count, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<typeof userDocument>("users")
      .search<typeof userDocument>(userSearch, {
        offset: start,
        limit: size,
        attributesToRetrieve: ["id"],
      });

    const users = hits.map((u) => u.id);

    const perms = await useDrizzle()
      .select()
      .from(userPermissionsTable)
      .where(
        and(
          eq(
            userPermissionsTable.permission,
            perm as (typeof UserPermission.enumValues)[number]
          ),
          inArray(userPermissionsTable.user_id, users)
        )
      );

    const permsMap = useKeyBy(perms, "user_id");

    return {
      count: count ?? Infinity,
      users: users.map((id) => {
        return {
          id,
          perm: permsMap[id] ? true : false,
        };
      }),
    };
  })
);
