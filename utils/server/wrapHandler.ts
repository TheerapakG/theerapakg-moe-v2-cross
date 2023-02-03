import { H3Event, isError } from "h3";

export const wrapHandler = <ResT>(
  handler: (event: H3Event) => Promise<ResT>
) => {
  return async (event: H3Event) => {
    try {
      const ret = await handler(event);
      if (!getResponseHeader(event, "Cache-Control"))
        appendResponseHeader(event, "Cache-Control", "no-store");
      return ret;
    } catch (err) {
      if (!getResponseHeader(event, "Cache-Control"))
        appendResponseHeader(event, "Cache-Control", "no-store");
      if (isError(err)) {
        if (!process.dev && err.stack) delete err.stack;
        throw err;
      }
      console.error(err);
    }
    throw createError({
      statusCode: 500,
      statusMessage: "internal server error",
    });
  };
};
