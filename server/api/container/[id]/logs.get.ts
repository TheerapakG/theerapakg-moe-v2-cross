import { eq } from "drizzle-orm";
import { Stream } from "stream";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);
    if (!(await checkUserPerm(user, "container:inspect")))
      throw createError({ statusMessage: "no permission" });

    const id = event.context.params?.id;
    if (!id) throw createError({ statusMessage: "invalid id" });

    const _dockerId = await useDrizzle()
      .select({ dockerId: containerTable.dockerId })
      .from(containerTable)
      .where(eq(containerTable.id, id))
      .limit(1);

    const dockerId: string | undefined = _dockerId[0]?.dockerId;

    if (!dockerId)
      throw createError({ statusMessage: "no specified container" });

    const logStream = await useDocker().getContainer(dockerId).logs({
      follow: true,
      stdout: true,
      stderr: true,
      until: Date.now(),
      timestamps: true,
    });

    const logs: { type: "stdout" | "stderr"; time: string; msg: string }[] = [];

    const stdoutStream = new Stream.PassThrough();
    const stderrStream = new Stream.PassThrough();

    stdoutStream.on("data", (data) => {
      const time = data.subarray(0, 30).toString();
      const msg = data.subarray(31).toString("base64");
      logs.push({ type: "stdout", time, msg });
    });
    stderrStream.on("data", (data) => {
      const time = data.subarray(0, 30).toString();
      const msg = data.subarray(31).toString("base64");
      logs.push({ type: "stderr", time, msg });
    });

    const logStreamEnd = new Promise((resolve) =>
      logStream.on("end", () => resolve(undefined))
    );

    useDocker().modem.demuxStream(logStream, stdoutStream, stderrStream);
    logStream.resume();

    await logStreamEnd;

    return logs;
  })
);
