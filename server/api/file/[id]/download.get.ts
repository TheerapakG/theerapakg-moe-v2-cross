import { type } from "arktype";
import { eq } from "drizzle-orm";
import fs from "fs";
import mime from "mime";

const paramValidator = type({
  id: "uuid",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const {
      param: { id },
    } = await validateEvent({ param: paramValidator }, event);

    const [
      {
        perms: { view },
      },
    ] = await checkFilesUserPerm([id], user);
    if (!view) throw createError({ statusMessage: "no permission" });

    const _dir = await useDrizzle()
      .select({ dir: fileTable.dir })
      .from(fileTable)
      .where(eq(fileTable.id, id))
      .limit(1);

    const dir: string | undefined = _dir[0]?.dir;

    if (dir) {
      const length = (await fs.promises.stat(dir)).size;

      appendResponseHeaders(event, {
        "Cache-Control": "private",
        "Content-Type": mime.getType(dir) ?? "",
        "Accept-Ranges": "bytes",
      });

      const range = getRequestHeader(event, "range");

      if (range) {
        // TODO: use validator
        const [unit, ranges] = range.split("=");
        if (unit !== "bytes" || !ranges) {
          event.node.res.statusCode = 416;
          return "";
        }

        const parsedRanges = ranges.split(",").map((s) => {
          const trimmedRange = s.trim();
          if (trimmedRange.startsWith("-"))
            return [undefined, parseInt(s.slice(1).trim())] as [
              undefined,
              number
            ];
          if (trimmedRange.endsWith("-"))
            return [parseInt(s.slice(undefined, -1).trim()), undefined] as [
              number,
              undefined
            ];
          const [ret1, ret2] = trimmedRange
            .split("-", 2)
            .map((s) => parseInt(s.trim()));
          return [ret1, ret2] as [number, number];
        });

        // TODO: multiple range
        const retRange = [
          parsedRanges[0][0] ?? length - parsedRanges[0][1],
          parsedRanges[0][1] ?? length - 1,
        ];

        if (retRange[0] < 0 || retRange[1] >= length) {
          event.node.res.statusCode = 416;
          return "";
        }

        appendResponseHeader(
          event,
          "Content-Range",
          `bytes ${retRange[0]}-${retRange[1]}/${length}`
        );
        event.node.res.statusCode = 206;

        return sendStream(
          event,
          fs.createReadStream(dir, { start: retRange[0], end: retRange[1] })
        );
      }

      appendResponseHeader(event, "Content-Length", length.toString());
      return sendStream(event, fs.createReadStream(dir));
    }
  })
);
