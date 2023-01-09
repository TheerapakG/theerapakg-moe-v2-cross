import Docker from "dockerode";
let docker: Docker | null = null;

export const useDocker = () => {
  if (!docker) {
    docker = new Docker({
      ...(useRuntimeConfig().dockerSocketPath && {
        socketPath: useRuntimeConfig().dockerSocketPath,
      }),
      ...(useRuntimeConfig().dockerHost && {
        host: useRuntimeConfig().dockerHost,
      }),
      ...(useRuntimeConfig().dockerPort && {
        port: useRuntimeConfig().dockerPort,
      }),
    });
  }

  return docker;
};
