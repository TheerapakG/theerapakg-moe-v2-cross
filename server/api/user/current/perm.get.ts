export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    return {
      perms: await checkUserPerm(user),
    };
  }),
);
