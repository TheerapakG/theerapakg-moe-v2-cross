import fs from "fs";
import path from "path";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  try {
    const dir = await useRedis().get(`file:${event.context.params.id}`);

    if (dir) {
      return {
        status: 0,
        value: {
          name: path.basename(dir),
          size: (await fs.promises.stat(dir)).size,
          url: `/api/file/download/${event.context.params.id}`,
        },
      };
    }
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
