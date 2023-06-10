import { appendResponseHeader } from "h3";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.meta.perms) return;

  const permValues = await Promise.all(
    to.meta.perms.map(
      async (perm) =>
        (
          await $apiFetch(`/api/user/current/perm/${encodeURIComponent(perm)}`)
        ).value
    )
  );

  if (!permValues.every((permValue) => permValue)) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" });
  }

  const event = useRequestEvent();

  if (event) {
    appendResponseHeader(event, "Cache-Control", "private");
  }
});
