<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 w-full px-8">
      <div v-if="pending">loading...</div>
      <div v-else-if="!fileInfo"></div>
      <div v-else class="relative w-full">
        <div
          class="absolute right-0 flex place-content-center place-items-center gap-x-2"
        >
          <FileButtonViewerMode
            :file-id="(route.params.file as string)"
            :mime="fileInfo?.mime"
          />
        </div>
        <div class="flex place-content-center place-items-center">
          <div class="font-bold">{{ fileInfo.name }}</div>
        </div>
      </div>
    </div>
    <div
      class="flex w-full flex-grow flex-col place-content-start place-items-center px-8"
    >
      <div
        class="flex w-full flex-grow flex-col place-content-start place-items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
      >
        <NuxtPage class="w-full flex-grow" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mountedKey } from "./provides";

provide(mountedKey, useMounted());

const route = useRoute();

const {
  pending,
  data: fileInfo,
  //error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);
</script>
