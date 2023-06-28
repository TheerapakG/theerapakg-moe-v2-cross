<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 h-8 w-full px-8">
      <div
        v-if="!fileInfo"
        class="inline-flex place-content-center place-items-center"
      >
        <USkeleton class="h-8 w-80" />
      </div>
      <div v-else class="relative h-full w-full">
        <div
          class="absolute left-0 inline-flex h-full place-content-center place-items-center md:left-16"
        >
          <portal-target name="file-menu-left" />
        </div>
        <div
          class="absolute right-0 inline-flex h-full place-content-center place-items-center gap-x-2"
        >
          <UButton
            variant="ghost"
            size="xl"
            icon="i-heroicons-arrow-down-tray"
            :ui="{ rounded: 'rounded-full' }"
            :to="`/file/download/${fileId}`"
          />
          <UPopover>
            <UButton
              variant="ghost"
              size="xl"
              icon="i-heroicons-key"
              :ui="{ rounded: 'rounded-full' }"
            />

            <template #panel>
              <FileButtonPermEditor v-slot="{ perm }" :file-id="fileId">
                <UButton
                  variant="ghost"
                  size="xl"
                  :trailing-icon="perms[perm]"
                  :label="`${filePermUserCount?.count?.[perm] ?? '...'}`"
                  :ui="{ rounded: 'rounded-full' }"
                />
              </FileButtonPermEditor>
            </template>
          </UPopover>
          <FileButtonViewerMode :file-id="fileId" />
        </div>
        <div class="mx-32 flex h-full place-content-center place-items-center">
          <FileNameEditor
            class="list-move min-w-0 font-bold"
            :file-id="fileId"
            :name="fileInfo.name"
            :download="false"
          />
          <div
            class="list-move flex h-full place-content-center place-items-center"
          >
            <portal-target name="file-status" />
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex w-full flex-grow flex-col place-content-start place-items-center px-8"
    >
      <div
        class="flex w-full flex-grow flex-col place-content-start place-items-center rounded-lg border-2 border-gray-500 p-4 dark:border-gray-400"
      >
        <NuxtPage class="w-full flex-grow" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMountedState } from "./states";

const mountedState = useMountedState();

const mounted = useMounted();
watch(mounted, () => {
  mountedState.value = mounted.value;
});
mountedState.value = mounted.value;

const route = useRoute();
const fileStore = useFileStore();
const filePermStore = useFilePermStore();
const routeStore = useRouteStore();

const fileId = route.params.file as string;

const perms = {
  view: "i-heroicons-eye",
  edit: "i-heroicons-pencil",
};

const fileInfo = await fileStore.fetchFile(fileId);
const filePermUserCount = await filePermStore.fetchFilePermCount(fileId);

routeStore.setTitle(computed(() => `theerapakg-moe-app: ${fileInfo?.name}`));
</script>
