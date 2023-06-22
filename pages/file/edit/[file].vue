<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 h-8 w-full px-8">
      <div
        v-if="pending"
        class="inline-flex place-content-center place-items-center"
      >
        <USkeleton class="h-8 w-80" />
      </div>
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
          <UPopover>
            <UButton
              variant="ghost"
              size="xl"
              icon="i-heroicons-key"
              :ui="{ rounded: 'rounded-full' }"
            />

            <template #panel>
              <FileButtonPermEditorGroup
                v-slot="{ perm, permUserCount }"
                :file-id="(route.params.file as string)"
              >
                <UButton
                  variant="ghost"
                  size="xl"
                  :trailing-icon="perms[perm]"
                  :label="`${permUserCount}`"
                  :ui="{ rounded: 'rounded-full' }"
                />
              </FileButtonPermEditorGroup>
            </template>
          </UPopover>
          <FileButtonViewerMode :file-id="(route.params.file as string)" />
        </div>
        <div class="mx-32 flex h-full place-content-center place-items-center">
          <FileNameEditor
            class="list-move min-w-0 font-bold"
            :file-id="(route.params.file as string)"
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

const perms = {
  view: "i-heroicons-eye",
  edit: "i-heroicons-pencil",
};

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
