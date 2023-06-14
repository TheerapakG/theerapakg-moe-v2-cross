import { H3Event, isError as isH3Error } from "h3";
import { useRedis } from "./useRedis";
import { getSafeIdFromId } from "./getId";

export const getUser = async (event: H3Event) => {
  try {
    return (await getUserBySession(
      getCookie(event, "session_id")
    )) as `user:id:${string}`;
  } catch (error) {
    if (isH3Error(error) && error.statusMessage === "session expired") {
      deleteCookie(event, "session_id");
    }
    throw error;
  }
};

export const getUserBySession = async (session?: string) => {
  const user = await useRedis().get(
    session ? `session:${getSafeIdFromId(session)}` : "session:default"
  );
  if (!user) {
    throw createError({ statusMessage: "session expired" });
  }
  return user as `user:id:${string}`;
};
