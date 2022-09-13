import { useRedis } from "~/server/utils/useRedis";
import { getUser } from "~/server/utils/getUser";
import { getFilePermForUser } from "~/server/utils/getFilePermForUser";

export default defineEventHandler(async (event) => {
  const user = await getUser(event);

  const id = (event.context.params.id as string).split(":", 2)[0];
  const perm = (event.context.params.perm as string).split(":", 2)[0];
  const targetId = (event.context.params.user as string).split(":", 2)[0];

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  try {
    const { edit } = await getFilePermForUser(`file:${id}`, user);

    if (edit) {
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
  } catch (err) {
    console.error(err);
  }

  return {
    status: -1,
  };
});
