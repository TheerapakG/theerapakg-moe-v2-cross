import { type } from "arktype";
import { count, inArray } from "drizzle-orm";
import { keyBy as useKeyBy, groupBy as useGroupBy, isEmpty } from "lodash-es";

const queryValidator = type({
  ids: [
    type([
      "string",
      "|>",
      (s) =>
        s
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0),
    ]),
    "|>",
    type("0 <= uuid[] <= 50"),
  ],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      query: { ids },
    } = await validateEvent({ query: queryValidator }, event);

    await checkFilesUserPerm(ids, user);

    if (isEmpty(ids)) return [];

    const counts = await useDrizzle()
      .select({
        id: fileUserPermissionsTable.file_id,
        perm: fileUserPermissionsTable.permission,
        countValue: count(),
      })
      .from(fileUserPermissionsTable)
      .where(inArray(fileUserPermissionsTable.file_id, ids))
      .groupBy(
        fileUserPermissionsTable.file_id,
        fileUserPermissionsTable.permission,
      );

    const countMap = useGroupBy(counts, "id");

    return ids.map((id) => {
      const permMap = useKeyBy(countMap[id], "perm");

      return {
        id,
        count: {
          view: permMap["file!:view"]?.countValue ?? 0,
          edit: permMap["file!:edit"]?.countValue ?? 0,
        },
      };
    });
  }),
);
