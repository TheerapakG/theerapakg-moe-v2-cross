import _ from "lodash";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  const id = (event.context.params.id as string).split(":", 2)[0];
  const perm = (event.context.params.perm as string).split(":", 2)[0];
  const targetId = (event.context.params.user as string).split(":", 2)[0];

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  const [errs, [editPerm, fileEditPerm, { owner }]] = _.zip(
    ...(await useRedis()
      .multi()
      .sismember(`${user}:perms`, "perms:file:edit")
      .zscore(`file:${id}:perms:edit`, user)
      .hgetall(`file:${id}`)
      .exec())
  ) as [Array<Error>, [number, string, { dir: string; owner: string }]];

  if (
    errs.every((e) => !e) &&
    (editPerm > 0 || parseInt(fileEditPerm) > 0 || owner === user)
  ) {
    await useRedis().zadd(`file:${id}:perms:${perm}`, 1, `user:${targetId}`);
    return {
      status: 0,
    };
  } else {
    return {
      status: -8,
      error: "no permission",
    };
  }
});
