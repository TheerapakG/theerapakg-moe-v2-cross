import _ from "lodash";
import { useRedis } from "~/utils/server/useRedis";
import { getSafeIdFromIdObject } from "~/utils/server/getId";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { getUser } from "~/utils/server/getUser";
import { useDocker } from "~/utils/server/useDocker";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const query = getQuery(event);
    const user = await getUser(event);
    if (
      (await useRedis().sismember(`perms:${user}`, "perms:container:list")) <= 0
    )
      throw createError({ statusMessage: "no permission" });

    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size
      ? _.min([parseInt(query.size as string), 50]) ?? 10
      : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;

    const ids = (await useRedis().zrange(
      "container:ids",
      start,
      stop
    )) as `container:${string}`[];

    const containers = await (async () => {
      const [errs, containers] = _.zip(
        ...((await useRedis()
          .multi(ids.map((id) => ["hgetall", id]))
          .exec()) ?? [])
      ) as [
        Error[] | undefined,
        { dockerId: string; owner: `user:id:${string}` }[] | undefined
      ];

      errs?.forEach((e) => {
        if (e) throw e;
      });

      if (containers && containers.some((e) => !e)) return;
      return containers ?? [];
    })();

    if (!containers) return;

    const containerInfos = await Promise.all(
      containers.map(async (container) => {
        const {
          State: {
            Dead: dead,
            Paused: paused,
            Running: running,
            Status: status,
          },
        } = await useDocker().getContainer(container.dockerId).inspect();
        return {
          state: {
            dead,
            paused,
            running,
            status,
          },
        };
      })
    );

    if (!containerInfos) return;

    const strippedIds = ids.map(getSafeIdFromIdObject<"container">);

    return {
      count: await useRedis().zcount("container:ids", "-inf", "inf"),
      containers: _.zipWith(
        strippedIds,
        containers,
        containerInfos,
        (id, container, info) => {
          return {
            id,
            owner: container.owner,
            state: info.state,
          };
        }
      ),
    };
  })
);
