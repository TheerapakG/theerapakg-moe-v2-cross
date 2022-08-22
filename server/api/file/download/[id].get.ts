import fs from "fs";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  try {
    const dir = await useRedis().get(`file:${event.context.params.id}`);

    if (dir) {
      return sendStream(event, fs.createReadStream(dir));
    }
  } catch (err) {
    console.error(err);
  }

  return sendStream(event, "");
});
