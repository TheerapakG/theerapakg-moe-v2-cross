export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    if (user === "00000000-0000-0000-0000-000000000000") {
      throw createError({ statusMessage: "no permission" });
    }

    await useRedis().del(`session:${getCookie(event, "session_id")}`);

    deleteCookie(event, "session_id");

    return {};
  })
);
