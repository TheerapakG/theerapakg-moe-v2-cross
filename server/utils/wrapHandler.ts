import { H3Event, isError } from "h3";

export const wrapHandler = <ResT>(
  handler: (event: H3Event) => Promise<ResT>
) => {
  return async (event: H3Event) => {
    try {
      return await handler(event);
    } catch (err) {
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
