import Docker from "dockerode";
let docker: Docker | null = null;

export const useDocker = () => {
  if (!docker) {
    docker = new Docker();
  }

  return docker;
};
