import { H3Event, isError as isH3Error } from "h3";

const getSafeIdFromId = (id: string | undefined) =>
  (id && id.split(":").pop()) ?? "";

export const getUser = async (event: H3Event) => {
  try {
    return await getUserBySession(getCookie(event, "session_id"));
  } catch (error) {
    if (isH3Error(error) && error.statusMessage === "session expired") {
      deleteCookie(event, "session_id");
    }
    throw error;
  }
};

export const getUserBySession = async (session?: string) => {
  const user = await useRedis().get(
    session ? `session:${getSafeIdFromId(session)}` : "session:default",
  );
  if (!user) {
    throw createError({ statusMessage: "session expired" });
  }
  return user;
};
