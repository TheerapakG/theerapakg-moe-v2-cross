import fs from "fs";
import _ from "lodash";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  if (!user) {
    return sendStream(event, "");
  }

  const [errs, [user_perm, file_perm, { dir, owner }]] = _.zip(
    ...(await useRedis()
      .multi()
      .sismember(`${user}:perms`, "perms:file:view")
      .sismember(`file:${event.context.params.id}:perms:view`, user)
      .hgetall(`file:${event.context.params.id}`)
      .exec())
  ) as [Array<Error>, [number, number, { dir?: string; owner?: string }]];

  if (
    errs.every((e) => !e) &&
    (user_perm > 0 || file_perm > 0 || owner === user) &&
    dir
  ) {
    try {
      if (dir) {
        return sendStream(event, fs.createReadStream(dir));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return sendStream(event, "");
});
