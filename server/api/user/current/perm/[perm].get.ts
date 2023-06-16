import { UserPermission } from "~/schema/user_permission";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    if (!event.context.params) {
      throw createError({
        statusCode: 500,
        statusMessage: "invalid params",
      });
    }

    return {
      value: await checkUserPerm(
        user,
        event.context.params.perm as (typeof UserPermission.enumValues)[number]
      ),
    };
  })
);
