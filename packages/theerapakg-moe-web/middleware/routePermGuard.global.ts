import { appendResponseHeader } from "h3";

export default defineNuxtRouteMiddleware(async (to) => {
  const routePerm = await fetchRoutePerm(to);

  if (!routePerm.havePerm) {
    if (process.client) {
      const toast = useToast();
      toast.add({
        title: "Error loading the page",
        description: "Page not found",
        color: "red",
      });
      return abortNavigation({
        statusCode: 404,
        statusMessage: "Page not found",
      });
    } else {
      throw createError({ statusCode: 404, statusMessage: "Page not found" });
    }
  }

  if (routePerm.requirePerm) {
    const event = useRequestEvent();
    if (event) appendResponseHeader(event, "Cache-Control", "private");
  }
});
