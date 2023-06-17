import argon2 from "argon2";
import crypto from "crypto";
import { eq } from "drizzle-orm";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const body = await readBody(event);
    if (!body.user) return;

    const _user = await useDrizzle()
      .select({
        id: userTable.id,
        phash: userTable.phash,
      })
      .from(userTable)
      .where(eq(userTable.name, body.user))
      .limit(1);

    const user: { id: string; phash: string | null } | undefined = _user[0];

    if (!user) {
      console.log(`login attempt for user ${body.user}: FAIL`);
      throw createError({
        statusCode: 403,
        statusMessage: "authentication failed",
      });
    }

    if (body.pass) {
      if (!(user.phash && (await argon2.verify(user.phash, body.pass)))) {
        console.log(`login attempt for user ${body.user}: FAIL`);
        throw createError({
          statusCode: 403,
          statusMessage: "authentication failed",
        });
      }
    }

    console.log(`login attempt for user ${body.user}: PASS`);
    const sessionId = crypto.randomUUID();
    await useRedis()
      .multi()
      .set(`session:${sessionId}`, user.id)
      .expire(`session:${sessionId}`, 60 * 60 * 24)
      .exec();

    setCookie(event, "session_id", sessionId, { path: "/" });

    return {};
  })
);
