import fs from "fs";
import path from "path";
import _ from "lodash";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  const [errs, [user_view_perm, user_list_perm, file_perm, { dir, owner }]] =
    _.zip(
      ...(await useRedis()
        .multi()
        .sismember(`${user}:perms`, "perms:file:view")
        .sismember(`${user}:perms`, "perms:file:list")
        .sismember(`file:${event.context.params.id}:perms:view`, user)
        .hgetall(`file:${event.context.params.id}`)
        .exec())
    ) as [
      Array<Error>,
      [number, number, number, { dir: string; owner: string }]
    ];

  if (
    errs.every((e) => !e) &&
    (user_view_perm > 0 ||
      user_list_perm > 0 ||
      file_perm > 0 ||
      owner === user) &&
    dir
  ) {
    try {
      if (dir) {
        return {
          status: 0,
          value: {
            name: path.basename(dir),
            owner,
            size: (await fs.promises.stat(dir)).size,
            url: `/api/file/download/${event.context.params.id}`,
          },
        };
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    return {
      status: -8,
      error: "no permission",
    };
  }

  return {
    status: -1,
  };
});
