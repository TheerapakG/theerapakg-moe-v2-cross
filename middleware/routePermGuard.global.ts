import { appendResponseHeader } from "h3";

export default defineNuxtRouteMiddleware(async (to) => {
  const permStore = usePermStore();

  if (!to.meta.perms) return;

  if (
    (
      await Promise.all(to.meta.perms.map((perm) => permStore.usePerm(perm)))
    ).some((permRef) => !permRef.value)
  ) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" });
  }

  const event = useRequestEvent();

  if (event) {
    appendResponseHeader(event, "Cache-Control", "private");
  }
});
