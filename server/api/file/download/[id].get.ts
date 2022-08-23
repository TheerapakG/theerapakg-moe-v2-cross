import fs from "fs";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  if (
    user &&
    (
      await useRedis()
        .multi()
        .sismember(`${user}:perms`, "perms:file:view")
        .sismember(`file:${event.context.params.id}:perms:view`, user)
        .exec()
    ).some(([err, res]) => !err && res > 0)
  ) {
    try {
      const dir = await useRedis().hget(
        `file:${event.context.params.id}`,
        "dir"
      );

      if (dir) {
        return sendStream(event, fs.createReadStream(dir));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return sendStream(event, "");
});
