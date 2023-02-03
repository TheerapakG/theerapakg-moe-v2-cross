import { H3Event } from "h3";
import { useRedis } from "./useRedis";
import { getSafeIdFromId } from "./getId";

export const getUser = async (event: H3Event) => {
  const sessionCookie = getCookie(event, "session_id");
  const user = await useRedis().get(
    sessionCookie
      ? `session:${getSafeIdFromId(sessionCookie)}`
      : "session:default"
  );
  if (!user) {
    deleteCookie(event, "session_id");
    throw createError({ statusMessage: "session expired" });
  }
  return user as `user:id:${string}`;
};

export const getUserBySession = async (sessionCookie: string) => {
  const user = await useRedis().get(
    sessionCookie
      ? `session:${getSafeIdFromId(sessionCookie)}`
      : "session:default"
  );
  if (!user) {
    throw { statusMessage: "session expired" };
  }
  return user as `user:id:${string}`;
};
