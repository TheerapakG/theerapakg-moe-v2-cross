import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { getFilePermForUser } from "~/utils/server/getFilePermForUser";
import { getSafeIdFromId } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    const id = getSafeIdFromId(event.context.params?.id);
    const perm = getSafeIdFromId(event.context.params?.perm);
    const targetId = getSafeIdFromId(event.context.params?.user);

    const { edit } = await getFilePermForUser(`file:${id}`, user);
    if (!edit) throw createError({ statusMessage: "no permission" });

    await useRedis().zadd(`perms:file:${id}:${perm}`, 1, `user:id:${targetId}`);
    return {};
  })
);
