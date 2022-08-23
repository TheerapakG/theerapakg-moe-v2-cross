import fs from "fs";
import path from "path";
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
      const { dir, owner } = await useRedis().hgetall(
        `file:${event.context.params.id}`
      );

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
