import crypto from "crypto";
import argon2 from "argon2";

import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const body = await useBody(event);

  if (body.user && body.pass) {
    try {
      const user = await useRedis().get(`user:name:${body.user}`);

      if (user) {
        const phash = await useRedis().hget(user, "phash");

        if (phash && (await argon2.verify(phash, body.pass))) {
          const sessionId = crypto.randomUUID();
          await useRedis()
            .multi()
            .set(`session:${sessionId}`, user)
            .expire(`session:${sessionId}`, 60 * 60 * 24)
            .exec();

          setCookie(event, "session_id", sessionId);

          return {
            status: 0,
          };
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return {
    status: -1,
  };
});
