import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const query = useQuery(event);

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

  if ((await useRedis().sismember(`${user}:perms`, "perms:file:list")) > 0) {
    const start = query.start ? parseInt(query.start as string) : 0;
    const stop =
      start + (query.count ? parseInt(query.count as string) : 10) - 1;
    try {
      const ids = await useRedis().zrange("file:ids", start, stop);

      if (ids) {
        return {
          status: 0,
          value: {
            ids: ids.map((id) => id.split(":").pop()),
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
