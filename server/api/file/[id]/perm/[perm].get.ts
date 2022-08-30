import _ from "lodash";
import { useRedis } from "~/utils/useRedis";

export default defineEventHandler(async (event) => {
  const query = useQuery(event);

  const user = await useRedis().get(
    getCookie(event, "session_id")
      ? `session:${getCookie(event, "session_id")}`
      : "session:default"
  );

  const id = (event.context.params.id as string).split(":", 2)[0];
  const perm = (event.context.params.perm as string).split(":", 2)[0];

  if (!user) {
    return {
      status: -2,
      error: "session expired",
    };
  }

  const [
    errs,
    [viewPerm, listPerm, editPerm, fileViewPerm, fileEditPerm, { owner }],
  ] = _.zip(
    ...(await useRedis()
      .multi()
      .sismember(`${user}:perms`, "perms:file:view")
      .sismember(`${user}:perms`, "perms:file:list")
      .sismember(`${user}:perms`, "perms:file:edit")
      .zscore(`file:${id}:perms:view`, user)
      .zscore(`file:${id}:perms:edit`, user)
      .hgetall(`file:${id}`)
      .exec())
  ) as [
    Array<Error>,
    [number, number, number, string, string, { dir: string; owner: string }]
  ];

  if (
    errs.every((e) => !e) &&
    (viewPerm > 0 ||
      listPerm > 0 ||
      editPerm > 0 ||
      parseInt(fileViewPerm) > 0 ||
      parseInt(fileEditPerm) > 0 ||
      owner === user)
  ) {
    const page = query.page ? parseInt(query.page as string) : 1;
    const size = query.size ? _.min([parseInt(query.size as string), 50]) : 10;
    const start = (page - 1) * size;
    const stop = start + size - 1;

    const [errs, [count, userCount, users]] = _.zip(
      ...(await useRedis()
        .multi()
        .zcount(`file:${id}:perms:${perm}`, "-inf", "inf")
        .zcount("user:ids", "-inf", "inf")
        .zrange("user:ids", start, stop)
        .exec())
    ) as [Array<Error>, [number, number, string[]]];

    if (errs.every((e) => !e)) {
      const [errs, perms] = _.zip(
        ...(await useRedis()
          .multi(
            users.map((user) => ["zscore", `file:${id}:perms:${perm}`, user])
          )
          .exec())
      ) as [Array<Error>, Array<string>];

      if (errs.every((e) => !e)) {
        return {
          status: 0,
          value: {
            count,
            userCount,
            users: _.zipWith(users, perms, (user, perm) => {
              return {
                id: user.split(":", 2)[1],
                perm: parseInt(perm) > 0,
              };
            }),
          },
        };
      }
    }
  } else {
    return {
      status: -8,
      error: "no permission",
    };
  }

  return {
    status: -1,
  };
});
