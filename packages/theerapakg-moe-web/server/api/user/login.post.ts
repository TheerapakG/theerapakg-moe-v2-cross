import { type } from "arktype";
import argon2 from "argon2";
import crypto from "crypto";
import { eq } from "drizzle-orm";

const bodyValidator = type({
  user: "string",
  pass: "string",
});

export default defineEventHandler(
  wrapHandler(async (event) => {
    const { body } = await validateEvent({ body: bodyValidator }, event);

    console.log("before SELECT");

    const _user = await useDrizzle()
      .select({
        id: userTable.id,
        phash: userTable.phash,
      })
      .from(userTable)
      .where(eq(userTable.name, body.user))
      .limit(1);

    console.log("after SELECT/before verify");

    const user: { id: string; phash: string | null } | undefined = _user[0];

    if (!user) {
      console.log(`login attempt for user ${body.user}: FAIL`);
      throw createError({
        statusCode: 403,
        statusMessage: "authentication failed",
      });
    }

    if (!(user.phash && (await argon2.verify(user.phash, body.pass)))) {
      console.log(`login attempt for user ${body.user}: FAIL`);
      throw createError({
        statusCode: 403,
        statusMessage: "authentication failed",
      });
    }

    console.log("after verify");

    console.log(`login attempt for user ${body.user}: PASS`);
    const sessionId = crypto.randomUUID();
    await useRedis()
      .multi()
      .set(`session:${sessionId}`, user.id)
      .expire(`session:${sessionId}`, 60 * 60 * 24)
      .exec();

    setCookie(event, "session_id", sessionId, { path: "/" });

    return {};
  }),
);
