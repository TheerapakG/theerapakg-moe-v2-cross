import { appendResponseHeader } from "h3";

export default defineNuxtRouteMiddleware(async (to) => {
  const permStore = usePermStore();

  if (!to.meta.perms) return;

  const permRefs = await Promise.all(
    to.meta.perms.map((perm) => permStore.usePerm(perm))
  );

  if (permRefs.some((permRef) => !permRef.value)) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" });
  }

  const event = useRequestEvent();

  if (event) {
    appendResponseHeader(event, "Cache-Control", "private");
  }
});
