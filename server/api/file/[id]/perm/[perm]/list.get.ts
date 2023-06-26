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
  id: "uuid",
  perm: "'view'|'edit'",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      query,
      param: { id, perm },
    } = await validateEvent(
      { query: queryValidator, param: paramValidator },
      event
    );
    const { page, size, user: target } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    await checkFilesUserPerm([id], user);

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
      .from(fileUserPermissionsTable)
      .where(
        and(
          eq(fileUserPermissionsTable.file_id, id),
          eq(fileUserPermissionsTable.permission, `file!:${perm}`),
          inArray(fileUserPermissionsTable.user_id, users)
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
