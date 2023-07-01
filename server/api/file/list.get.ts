import { type } from "arktype";
import defu from "defu";
import { isEqual } from "lodash-es";

const queryValidator = type({
  "file?": "string",
  "users?": [
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
  "page?": ["parsedInteger", "|>", type("integer>0")],
  "size?": ["parsedInteger", "|>", type("integer<=50")],
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const { query } = await validateEvent({ query: queryValidator }, event);
    const {
      page,
      size,
      file: targetFile,
      users: targetUsers,
    } = defu(query, { page: 1, size: 10 });
    const start = (page - 1) * size;

    if (!isEqual(targetUsers, [user])) {
      if (!(await checkUserPerm(user)).includes("file:list"))
        throw createError({ statusMessage: "no permission" });
    }

    const { estimatedTotalHits: count, hits } = await useMeili(
      useRuntimeConfig().meiliSearchKey
    )
      .index<typeof fileDocument>("files")
      .search<typeof fileDocument>(targetFile, {
        offset: start,
        limit: size,
        filter: targetUsers
          ? `owner IN [${targetUsers.join(", ")}]`
          : undefined,
        attributesToRetrieve: ["id"],
      });

    const files = hits.map((f) => f.id);

    return {
      count: count ?? Infinity,
      files,
    };
  })
);
