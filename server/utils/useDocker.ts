import defu from "defu";
import Docker from "dockerode";
let docker: Docker | null = null;

export const useDocker = () => {
  if (!docker) {
    const config = useRuntimeConfig();
    docker = new Docker(
      defu(
        {},
        config.dockerSocketPath
          ? {
              socketPath: config.dockerSocketPath,
            }
          : undefined,
        config.dockerHost
          ? {
              host: config.dockerHost,
            }
          : undefined,
        config.dockerPort
          ? {
              port: config.dockerPort,
            }
          : undefined
      )
    );
  }

  return docker;
};
