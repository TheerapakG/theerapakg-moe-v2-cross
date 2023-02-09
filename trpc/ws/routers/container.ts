import { router, publicProcedure } from "../trpc";
import { observable } from "@trpc/server/observable";
import { Stream } from "stream";
import { z } from "zod";
import { parse } from "cookie-es";
import { useRedis } from "../../../utils/server/useRedis";
import { useDocker } from "../../../utils/server/useDocker";
import { getUserBySession } from "../../../utils/server/getUser";
import { IncomingMessage } from "http";

type ContainerLog = {
  type: "stdout" | "stderr";
  time: string;
  msg: string;
};

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

      const logStream = (await useDocker().getContainer(dockerId).logs({
        follow: true,
        stdout: true,
        stderr: true,
        until: Date.now(),
        timestamps: true,
      })) as IncomingMessage;

      return observable<ContainerLog>((emit) => {
        const stdoutStream = new Stream.PassThrough();
        const stderrStream = new Stream.PassThrough();

        stdoutStream.on("data", (data: Buffer) => {
          const time = data.subarray(0, 30).toString();
          const msg = data.subarray(31).toString("base64");
          emit.next({ type: "stdout", time, msg });
        });
        stderrStream.on("data", (data: Buffer) => {
          const time = data.subarray(0, 30).toString();
          const msg = data.subarray(31).toString("base64");
          emit.next({ type: "stderr", time, msg });
        });
        logStream.on("end", () => {
          emit.complete();
        });

        useDocker().modem.demuxStream(logStream, stdoutStream, stderrStream);
        logStream.resume();
        // unsubscribe function when client disconnects or stops subscribing
        return () => {
          logStream.destroy();
        };
      });
    }),
});
// export type definition of API
export type ContainerRouter = typeof containerRouter;
