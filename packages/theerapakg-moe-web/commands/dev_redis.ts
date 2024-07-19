import { type } from "arktype";
import { spawn } from "child_process";
import { loadNuxtConfig } from "@nuxt/kit";

(async () => {
  const nuxtOptions = await loadNuxtConfig({});
  const config = nuxtOptions.runtimeConfig;

  const proc = spawn("docker", [
    "run",
    "--name",
    "theerapakg-moe-redis",
    "-v",
    "./.redis:/data",
    ...(process.getuid && process.getgid
      ? ["-u", `${process.getuid()}:${process.getgid()}`]
      : []),
    "-d",
    "-p",
    `${type("number | parsedInteger")(config.redisPort)?.data ?? 6379}:6379`,
    "redis",
    "redis-server",
  ]);

  proc.stdout.on("data", (data) => {
    console.log(`${data}`);
  });
  proc.stderr.on("data", (data) => {
    console.error(`${data}`);
  });
  proc.on("close", process.exit);
})();
