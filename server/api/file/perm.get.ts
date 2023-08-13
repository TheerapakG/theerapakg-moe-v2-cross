import { type } from "arktype";
import { inArray, sql } from "drizzle-orm";
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
        count: sql`count(*)`,
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
      const view = permMap["file!:view"]?.count;
      const edit = permMap["file!:edit"]?.count;

      return {
        id,
        count: {
          view: typeof view === "string" ? parseInt(view) : 0,
          edit: typeof edit === "string" ? parseInt(edit) : 0,
        },
      };
    });
  }),
);
