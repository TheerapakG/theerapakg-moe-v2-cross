import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const query = useQuery(event);

  // TODO: proper auth
  if (query.pass && query.pass === process.env.PASS) {
    const start = parseInt(query.start as string) ?? 0;
    const stop = start + (parseInt(query.count as string) ?? 10) - 1;
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
  }

  return {
    status: -1,
  };
});
