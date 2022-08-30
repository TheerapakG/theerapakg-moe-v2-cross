import fs from "fs";
import _ from "lodash";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  const id = (event.context.params.id as string).split(":", 2)[0];

  if (!user) {
    return sendStream(event, "");
  }

  const [
    errs,
    [viewPerm, listPerm, editPerm, fileViewPerm, fileEditPerm, { dir, owner }],
  ] = _.zip(
    ...(await useRedis()
      .multi()
      .sismember(`${user}:perms`, "perms:file:view")
      .sismember(`${user}:perms`, "perms:file:list")
      .sismember(`${user}:perms`, "perms:file:edit")
      .zscore(`file:${id}:perms:view`, user)
      .zscore(`file:${id}:perms:edit`, user)
      .hgetall(`file:${id}`)
      .exec())
  ) as [
    Array<Error>,
    [number, number, number, string, string, { dir: string; owner: string }]
  ];

  if (
    errs.every((e) => !e) &&
    (viewPerm > 0 ||
      listPerm > 0 ||
      editPerm > 0 ||
      parseInt(fileViewPerm) > 0 ||
      parseInt(fileEditPerm) > 0 ||
      owner === user) &&
    dir
  ) {
    try {
      if (dir) {
        return sendStream(event, fs.createReadStream(dir));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return sendStream(event, "");
});
