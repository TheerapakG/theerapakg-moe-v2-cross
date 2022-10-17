<template>
  <div class="flex h-full flex-col">
    <div class="mb-8 flex place-content-center place-items-center">
      <div>{{ fileInfo.name }}</div>
      <div v-if="status.has('edit')" class="text-gray-600 dark:text-gray-300">
        &nbsp;- unsaved
      </div>
    </div>
    <NuxtPage class="flex-grow" @status="setStatus" />
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
  error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);

const setStatus = (newStatus: Set<string>) => {
  status.value = newStatus;
};
</script>
