<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 h-8 w-full px-8">
      <div v-if="pending">loading...</div>
      <div v-else-if="!fileInfo"></div>
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
            :to="`/file/download/${route.params.file}`"
          />
          <FileButtonViewerMode :file-info="fileInfoState" />
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

<script setup lang="ts">
import { useMountedState, useFileInfoState } from "./states";

const mountedState = useMountedState();
const fileInfoState = useFileInfoState();

const mounted = useMounted();
watch(mounted, () => {
  mountedState.value = mounted.value;
});
mountedState.value = mounted.value;

const route = useRoute();
const routeStore = useRouteStore();

const {
  pending,
  data: fileInfo,
  //error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);

const fileInfoComputed = computed(
  () =>
    (fileInfoState.value = fileInfo.value
      ? { ...fileInfo.value, id: route.params.file as string }
      : null)
);

watch(fileInfoComputed, () => {
  fileInfoState.value = fileInfoComputed.value;
});
fileInfoState.value = fileInfoComputed.value;

routeStore.setTitle(
  computed(() => `theerapakg-moe-app: ${fileInfo.value?.name}`)
);
</script>
