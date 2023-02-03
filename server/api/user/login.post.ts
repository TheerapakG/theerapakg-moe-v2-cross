import crypto from "crypto";
import argon2 from "argon2";

import { useRedis } from "~/utils/server/useRedis";
import { wrapHandler } from "~/utils/server/wrapHandler";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const body = await readBody(event);
    if (!(body.user && body.pass)) return;

    const user = await useRedis().get(`user:name:${body.user}`);
    if (!user) return;

    const phash = await useRedis().hget(user, "phash");
    if (!(phash && (await argon2.verify(phash, body.pass)))) {
      console.log(`login attempt for user ${body.user}: FAIL`);
      throw createError({
        statusMessage: "authentication failed",
      });
    }

    console.log(`login attempt for user ${body.user}: PASS`);
    const sessionId = crypto.randomUUID();
    await useRedis()
      .multi()
      .set(`session:${sessionId}`, user)
      .expire(`session:${sessionId}`, 60 * 60 * 24)
      .exec();

    setCookie(event, "session_id", sessionId, { path: "/" });

    return {};
  })
);
