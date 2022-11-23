import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";

interface FilePermission {
  view: boolean;
  edit: boolean;
  owner: `user:id:${string}`;
}

export const getFilePermForUser = async (
  file: string,
  user: string
): Promise<FilePermission> => {
  const [
    errs,
    [viewPerm, listPerm, editPerm, fileViewPerm, fileEditPerm, owner],
  ] = _.zip(
    ...((await useRedis()
      .multi()
      .sismember(`perms:${user}`, "perms:file:view")
      .sismember(`perms:${user}`, "perms:file:list")
      .sismember(`perms:${user}`, "perms:file:edit")
      .zscore(`perms:${file}:view`, user)
      .zscore(`perms:${file}:edit`, user)
      .hget(`${file}`, "owner")
      .exec()) ?? [])
  ) as [Error[], [number, number, number, string, string, `user:id:${string}`]];

  if (errs.some((e) => e)) {
    throw new AggregateError(errs.filter((e) => e));
  }

  const edit = user == owner || editPerm > 0 || parseInt(fileEditPerm) > 0;
  const view =
    edit || listPerm > 0 || viewPerm > 0 || parseInt(fileViewPerm) > 0;

  return { view, edit, owner };
};
