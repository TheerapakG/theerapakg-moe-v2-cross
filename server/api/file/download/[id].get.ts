import fs from "fs";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const query = useQuery(event);

  const user = await useRedis().get(`session:${query.session ?? "default"}`);

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
