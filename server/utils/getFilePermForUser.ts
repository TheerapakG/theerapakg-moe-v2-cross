import _ from "lodash";
import { useRedis } from "~/server/utils/useRedis";

interface FilePermission {
  view: boolean;
  edit: boolean;
  owner: string;
}

export const getFilePermForUser = async (
  file: string,
  user: string
): Promise<FilePermission> => {
  const [
    errs,
    [viewPerm, listPerm, editPerm, fileViewPerm, fileEditPerm, owner],
  ] = _.zip(
    ...(await useRedis()
      .multi()
      .sismember(`${user}:perms`, "perms:file:view")
      .sismember(`${user}:perms`, "perms:file:list")
      .sismember(`${user}:perms`, "perms:file:edit")
      .zscore(`${file}:perms:view`, user)
      .zscore(`${file}:perms:edit`, user)
      .hget(`${file}`, "owner")
      .exec())
  ) as [Error[], [number, number, number, string, string, string]];

  if (errs.some((e) => e)) {
    throw new AggregateError(errs.filter((e) => e));
  }

  const edit = user == owner || editPerm > 0 || parseInt(fileEditPerm) > 0;
  const view =
    edit || listPerm > 0 || viewPerm > 0 || parseInt(fileViewPerm) > 0;

  return { view, edit, owner };
};
