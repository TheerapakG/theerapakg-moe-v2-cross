import { type } from "arktype";
import { inArray } from "drizzle-orm";
import { keyBy as useKeyBy } from "lodash-es";

const queryValidator = type({
  ids: [
    type(["string", "|>", (s) => s.split(",")]),
    "|>",
    type("0 < uuid[] <= 50"),
  ],
});
export default defineEventHandler(
  wrapHandler(async (event) => {
    const {
      query: { ids },
    } = await validateEvent({ query: queryValidator }, event);

    const users = await useDrizzle()
      .select({
        id: userTable.id,
        name: userTable.name,
      })
      .from(userTable)
      .where(inArray(userTable.id, ids));
    const userMap = useKeyBy(users, "id");

    return await Promise.all(
      ids.map(async (id) => {
        const user = userMap[id];

        return {
          id,
          name: user.name,
        };
      })
    );
  })
);
