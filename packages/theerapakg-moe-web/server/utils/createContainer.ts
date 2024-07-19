import type { ContainerCreateOptions } from "dockerode";

export const createContainer = async (
  user: string,
  opts: ContainerCreateOptions,
) => {
  const dockerId = await new Promise<string>((resolve, reject) => {
    useDocker().createContainer(opts, (err, container) => {
      if (!container) {
        reject(err);
        return;
      }
      resolve(container.id);
      container.start({});
    });
  });

  const [{ id }] = await useDrizzle()
    .insert(containerTable)
    .values({
      owner: user,
      dockerId,
    })
    .returning({
      id: containerTable.id,
    });

  return id;
};
