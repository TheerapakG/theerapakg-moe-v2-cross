<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 h-8 w-full px-8">
      <div v-if="pending">loading...</div>
      <div v-else-if="!fileInfo"></div>
      <div v-else class="relative h-full w-full">
        <div
          class="absolute left-0 flex h-full place-content-center place-items-center md:left-16"
        >
          <portal-target name="file-menu-left" />
        </div>
        <div
          class="absolute right-0 flex place-content-center place-items-center gap-x-2"
        >
          <NuxtLink :to="`/file/download/${route.params.file}`">
            <button
              class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
            >
              <ArrowDownTrayIcon class="h-6 w-6" />
            </button>
          </NuxtLink>
          <FileButtonViewerMode
            :file-id="(route.params.file as string)"
            :mime="fileInfo?.mime"
            :perms="fileInfo?.perms.user"
          />
        </div>
        <div class="mx-24 flex h-full place-content-center place-items-center">
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
        class="flex w-full flex-grow flex-col place-content-start place-items-center rounded-lg bg-gray-300 p-4 dark:bg-gray-600"
      >
        <NuxtPage class="w-full flex-grow" :file-info="fileInfo" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import { mountedKey } from "./provides";

provide(mountedKey, useMounted());

const route = useRoute();
const routeStore = useRouteStore();

const {
  pending,
  data: fileInfo,
  //error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);

routeStore.setTitle(
  computed(() => `theerapakg-moe-app: ${fileInfo.value?.name}`)
);
</script>
