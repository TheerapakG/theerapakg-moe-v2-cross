import fs from "fs/promises";

import { useDrizzle } from "~/utils/server/useDrizzle";
import { useRedis } from "~/utils/server/useRedis";
import { useMeili } from "~/utils/server/useMeili";
import { getUser } from "~/utils/server/getUser";
import { wrapHandler } from "~/utils/server/wrapHandler";
import { getSafeIdFromIdObject } from "~/utils/server/getId";

import { container as containerTable } from "~/schema/container";
import { file as fileTable } from "~/schema/file";
import { fileUserPermissions as fileUserPermissionsTable } from "~/schema/file_permission";
import { sh as shTable } from "~/schema/sh";
import { user as userTable } from "~/schema/user";
import {
  UserPermission,
  userPermissions as userPermissionsTable,
} from "~/schema/user_permission";

export default defineEventHandler(
  wrapHandler(async (event) => {
    const user = await getUser(event);

    if ((await useRedis().sismember(`perms:${user}`, "perms:migrate")) <= 0)
      throw createError({ statusMessage: "no permission" });

    const users = (await useRedis().keys("user:id:*")) as `user:id:${string}`[];

    await Promise.all(
      users.map(async (user_id) => {
        const user = await useRedis().hgetall(user_id);
        const safe_user_id = getSafeIdFromIdObject<"user:id">(user_id);
        const new_id =
          safe_user_id === "default"
            ? "00000000-0000-0000-0000-000000000000"
            : safe_user_id;

        await useDrizzle()
          .insert(userTable)
          .values({
            id: new_id,
            name: user.name,
            phash: user.phash,
          })
          .onConflictDoNothing();

        const perms = await useRedis().smembers(
          `perms:user:id:${safe_user_id}`
        );
        const new_perms = perms.map((perm) =>
          perm.split(":").slice(1).join(":")
        );

        await Promise.all(
          new_perms.map(async (new_perm) => {
            await useDrizzle()
              .insert(userPermissionsTable)
              .values({
                user_id: new_id,
                permission:
                  new_perm as (typeof UserPermission.enumValues)[number],
              })
              .onConflictDoNothing();
          })
        );

        const containers = (await useRedis().zrange(
          `container:user:id:${safe_user_id}:ids`,
          0,
          -1
        )) as `container:${string}`[];

        await Promise.all(
          containers.map(async (container_id) => {
            const safe_container_id =
              getSafeIdFromIdObject<"container">(container_id);
            const container = await useRedis().hgetall(container_id);

            if (container.dockerId)
              await useDrizzle()
                .insert(containerTable)
                .values({
                  id: safe_container_id,
                  owner: safe_user_id,
                  dockerId: container.dockerId,
                })
                .onConflictDoNothing();
          })
        );

        const files = (await useRedis().zrange(
          `file:user:id:${safe_user_id}:ids`,
          0,
          -1
        )) as `file:${string}`[];

        await Promise.all(
          files.map(async (file_id) => {
            const file = await useRedis().hgetall(file_id);
            const safe_file_id = getSafeIdFromIdObject<"file">(file_id);

            const stat = await fs.stat(file.dir);

            await useMeili(useRuntimeConfig().meiliApiKey)
              .index("files")
              .updateDocuments(
                [
                  {
                    id: safe_file_id,
                    created: stat.birthtime.getTime() / 1000,
                    modified: stat.mtime.getTime() / 1000,
                  },
                ],
                { primaryKey: "id" }
              );

            await useDrizzle()
              .insert(fileTable)
              .values({
                id: safe_file_id,
                dir: file.dir,
                owner: safe_user_id,
                created: stat.birthtime,
                modified: stat.mtime,
              })
              .onConflictDoNothing();

            const views = (await useRedis().zrange(
              `perms:file:${safe_file_id}:view`,
              0,
              -1
            )) as `user:id:${string}`[];

            await Promise.all(
              views.map(async (view_user_id) => {
                const safe_view_user_id =
                  getSafeIdFromIdObject<"user:id">(view_user_id);
                const new_view_id =
                  safe_view_user_id === "default"
                    ? "00000000-0000-0000-0000-000000000000"
                    : safe_view_user_id;

                await useDrizzle()
                  .insert(fileUserPermissionsTable)
                  .values({
                    file_id: safe_file_id,
                    user_id: new_view_id,
                    permission: "file!:view",
                  })
                  .onConflictDoNothing();
              })
            );

            const edits = (await useRedis().zrange(
              `perms:file:${safe_file_id}:edit`,
              0,
              -1
            )) as `user:id:${string}`[];

            await Promise.all(
              edits.map(async (edit_user_id) => {
                const safe_edit_user_id =
                  getSafeIdFromIdObject<"user:id">(edit_user_id);
                const new_edit_id =
                  safe_edit_user_id === "default"
                    ? "00000000-0000-0000-0000-000000000000"
                    : safe_edit_user_id;

                await useDrizzle()
                  .insert(fileUserPermissionsTable)
                  .values({
                    file_id: safe_file_id,
                    user_id: new_edit_id,
                    permission: "file!:edit",
                  })
                  .onConflictDoNothing();
              })
            );
          })
        );
      })
    );

    const shs = (await useRedis().zrange("sh:ids", 0, -1)) as `sh::${string}`[];

    await Promise.all(
      shs.map(async (sh) => {
        const from = getSafeIdFromIdObject<"sh:">(sh);
        const to = await useRedis().get(sh);

        if (to)
          await useDrizzle()
            .insert(shTable)
            .values({
              from,
              to,
            })
            .onConflictDoNothing();
      })
    );

    return {};
  })
);
