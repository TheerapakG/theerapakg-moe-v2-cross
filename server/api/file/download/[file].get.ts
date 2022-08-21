import fs from "fs";

export default defineEventHandler(async (event) => {
  try {
    const dir = await useStorage().getItem(
      `redis:file:${event.context.params.file}`
    );

    if (dir) {
      return sendStream(event, fs.createReadStream(dir));
    }
  } catch (err) {
    console.error(err);
  }

  return sendStream(event, "");
});
