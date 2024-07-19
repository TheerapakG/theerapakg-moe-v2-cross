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
const routeStore = useRouteStore();

const fileId = route.params.file as string;

const fileInfo = await fileStore.fetchFile(fileId);

routeStore.setTitle(computed(() => `theerapakg-moe-app: ${fileInfo?.name}`));
</script>

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
          <FileButtonViewerMode :file-id="fileId" />
        </div>
        <div class="mx-28 flex h-full place-content-center place-items-center">
          <div
            class="overflow-hidden text-ellipsis whitespace-nowrap font-bold"
          >
            {{ fileInfo.name }}
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
