import { spawn } from "child_process";
import { loadNuxtConfig } from "nuxt/kit";

(async () => {
  const nuxtOptions = await loadNuxtConfig({});
  const config = nuxtOptions.runtimeConfig;

  const proc = spawn("docker", [
    "run",
    "--name",
    "theerapakg-moe-postgres",
    "-e",
    `POSTGRES_USER=${config.postgresUsername}`,
    "-e",
    `POSTGRES_PASSWORD=${config.postgresPassword}`,
    "-v",
    "./.postgres:/var/lib/postgresql/data",
    "-u",
    `${process.getuid()}:${process.getgid()}`,
    "-d",
    "-p",
    `127.0.0.1:${config.postgresPort ?? 5432}:${config.postgresPort ?? 5432}`,
    "postgres",
  ]);

  proc.stdout.on("data", (data) => {
    console.log(`${data}`);
  });
  proc.stderr.on("data", (data) => {
    console.error(`${data}`);
  });
  proc.on("close", process.exit);
})();
