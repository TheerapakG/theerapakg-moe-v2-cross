import { useRedis } from "~/utils/server/useRedis";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { useDocker } from "~/utils/server/useDocker";
import { getSafeIdFromId } from "~/utils/server/getId";
import { Stream } from "stream";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (
      (await useRedis().sismember(
        `perms:${user}`,
        "perms:container:inspect"
      )) <= 0
    )
      throw createError({ statusMessage: "no permission" });

    const id = getSafeIdFromId(event.context.params.id as string);
    const dockerId = await useRedis().hget(`container:${id}`, "dockerId");

    if (!dockerId)
      throw createError({ statusMessage: "no specified container" });

    const logStream = await useDocker().getContainer(dockerId).logs({
      follow: true,
      stdout: true,
      stderr: true,
      until: Date.now(),
      timestamps: true,
    });

    const logs: { type: "stdout" | "stderr"; msg: string }[] = [];

    const stdoutStream = new Stream.PassThrough();
    const stderrStream = new Stream.PassThrough();

    stdoutStream.on("data", (data) =>
      logs.push({ type: "stdout", msg: data.toString("base64") })
    );
    stderrStream.on("data", (data) =>
      logs.push({ type: "stderr", msg: data.toString("base64") })
    );

    const logStreamEnd = new Promise((resolve) =>
      logStream.on("end", () => resolve(undefined))
    );

    useDocker().modem.demuxStream(logStream, stdoutStream, stderrStream);
    logStream.resume();

    await logStreamEnd;

    return logs;
  })
);