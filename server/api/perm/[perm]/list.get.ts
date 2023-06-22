import { type } from "arktype";
import defu from "defu";
import { and, eq, inArray } from "drizzle-orm";
import { keyBy as useKeyBy } from "lodash-es";

const queryValidator = type({
  "user?": "string",
  "page?": ["parsedInteger", "|>", type("integer>0")],
  "size?": ["parsedInteger", "|>", type("integer<=50")],
});

const paramValidator = type({
  perm: [
    type(["string", "|>", (s) => decodeURIComponent(s)]),
    "|>",
    type(getArkTypeEnumFromDrizzleEnum(UserPermission)),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user)).includes("perm:list"))
      throw createError({ statusMessage: "no permission" });

    const {
      query,
      param: { perm },
    } = await validateEvent(
      { query: queryValidator, param: paramValidator },
      event
    );
    const { page, size, user: target } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    const { estimatedTotalHits: count, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<typeof userDocument>("users")
      .search<typeof userDocument>(target, {
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
