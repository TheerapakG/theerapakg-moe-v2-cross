<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 w-full">
      <div v-if="pending">loading...</div>
      <div v-else class="flex place-content-center place-items-center">
        <div>{{ fileInfo.name }}</div>
        <div v-if="status.has('edit')" class="text-gray-600 dark:text-gray-300">
          &nbsp;- unsaved
        </div>
      </div>
    </div>
    <NuxtPage class="w-full flex-grow" @status="setStatus" />
  </div>
</template>

<script setup lang="ts">
import { status as statusKey } from "./[file].provide";
const route = useRoute();
const status = ref<Set<string>>(new Set());
provide(statusKey, status);

const {
  pending,
  data: fileInfo,
  //error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);

const setStatus = (newStatus: Set<string>) => {
  status.value = newStatus;
};
</script>
