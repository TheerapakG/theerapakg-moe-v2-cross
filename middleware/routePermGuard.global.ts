export default defineNuxtRouteMiddleware(async (to) => {
  const permStore = usePermStore();

  if (
    to.meta.perms &&
    (
      await Promise.all(to.meta.perms.map((perm) => permStore.usePerm(perm)))
    ).some((permRef) => !permRef.value)
  ) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" });
  }
});
