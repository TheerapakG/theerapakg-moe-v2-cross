import { type } from "arktype";
import { spawn } from "child_process";
import { loadNuxtConfig } from "@nuxt/kit";

(async () => {
  const nuxtOptions = await loadNuxtConfig({});
  const config = nuxtOptions.runtimeConfig;

  const proc = spawn("docker", [
    "run",
    "--name",
    "theerapakg-moe-meili",
    "-v",
    "./.meili:/meili_data",
    ...(process.getuid && process.getgid
      ? ["-u", `${process.getuid()}:${process.getgid()}`]
      : []),
    "-d",
    "-p",
    `${type("parsedInteger")(config.meiliPort)?.data ?? 7700}:7700`,
    "getmeili/meilisearch:v0.29",
  ]);

  proc.stdout.on("data", (data) => {
    console.log(`${data}`);
  });
  proc.stderr.on("data", (data) => {
    console.error(`${data}`);
  });
  proc.on("close", process.exit);
})();
