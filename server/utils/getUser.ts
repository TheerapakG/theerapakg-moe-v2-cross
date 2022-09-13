import { CompatibilityEvent } from "h3";
import { useRedis } from "~/server/utils/useRedis";
import { getSafeIdFromId } from "~/server/utils/getId";

export const getUser = async (event: CompatibilityEvent) => {
  return await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getSafeIdFromId(getCookie(event, "session_id"))}`
      : "session:default"
  );
};
