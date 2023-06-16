export default defineEventHandler(
  wrapHandler(async (event) => {
    return {
      id: await getUser(event),
    };
  })
);
