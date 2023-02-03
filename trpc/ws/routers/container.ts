import { router, publicProcedure } from "../trpc";
import { observable } from "@trpc/server/observable";
import { Stream } from "stream";
import { z } from "zod";
import { parse } from "cookie-es";
import { useRedis } from "../../../utils/server/useRedis";
import { useDocker } from "../../../utils/server/useDocker";
import { getUserBySession } from "../../../utils/server/getUser";

export const containerRouter = router({
  logs: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .subscription(async ({ ctx, input: { id } }) => {
      const cookieStr = ctx.headers.cookie ?? "";

      const session = (parse(cookieStr) as Record<string, string>)[
        "session_id"
      ];
      const user = await getUserBySession(session);
      if (
        (await useRedis().sismember(
          `perms:${user}`,
          "perms:container:inspect"
        )) <= 0
      )
        throw { statusMessage: "no permission" };

      const dockerId = await useRedis().hget(`container:${id}`, "dockerId");

      if (!dockerId) throw { statusMessage: "no specified container" };

      const logStream = await useDocker().getContainer(dockerId).logs({
        follow: true,
        stdout: true,
        stderr: true,
        until: Date.now(),
        timestamps: true,
      });

      return observable<{ type: "stdout" | "stderr"; msg: string }>((emit) => {
        const stdoutStream = new Stream.PassThrough();
        const stderrStream = new Stream.PassThrough();

        stdoutStream.on("data", (data) => {
          emit.next({ type: "stdout", msg: data.toString("base64") });
        });
        stderrStream.on("data", (data) =>
          emit.next({ type: "stderr", msg: data.toString("base64") })
        );

        useDocker().modem.demuxStream(logStream, stdoutStream, stderrStream);
        logStream.resume();
        // unsubscribe function when client disconnects or stops subscribing
        return () => {
          return undefined;
        };
      });
    }),
});
// export type definition of API
export type ContainerRouter = typeof containerRouter;
