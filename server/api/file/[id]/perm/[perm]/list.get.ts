import { type } from "arktype";
import { and, eq, inArray } from "drizzle-orm";
import { keyBy as useKeyBy } from "lodash-es";

const queryValidator = type({
  users: [
    type(["string", "|>", (s) => s.split(",")]),
    "|>",
    type("0 <= uuid[] <= 50"),
  ],
});

const paramValidator = type({
  id: "uuid",
  perm: "'view'|'edit'",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      query: { users },
      param: { id, perm },
    } = await validateEvent(
      { query: queryValidator, param: paramValidator },
      event
    );

    await checkFilesUserPerm([id], user);

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
      users: users.map((id) => {
        return {
          id,
          perm: permsMap[id] ? true : false,
        };
      }),
    };
  })
);
