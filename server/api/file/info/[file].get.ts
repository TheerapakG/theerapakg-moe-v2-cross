import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    const dir = await useStorage().getItem(
      `redis:file:${event.context.params.file}`
    );

    if (dir) {
      return {
        status: 0,
        value: {
          name: path.basename(dir),
          size: (await fs.promises.stat(dir)).size,
          url: `/api/file/download/${event.context.params.file}`,
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
