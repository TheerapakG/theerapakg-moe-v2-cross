<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 w-full px-8">
      <div v-if="pending">loading...</div>
      <div v-else class="relative w-full">
        <div class="absolute right-0">
          <div class="flex place-content-center place-items-center gap-2">
            <FileButtonPermEditorGroup
              v-slot="{ perm, permUserCount }"
              :file-id="(route.params.file as string)"
              :user-count="fileInfo.perms"
            >
              <div class="flex place-content-center place-items-center gap-1">
                {{ permUserCount }} <VNodeTemplate :render-node="perms[perm]" />
              </div>
            </FileButtonPermEditorGroup>
          </div>
        </div>
        <div class="flex place-content-center place-items-center">
          <div class="font-bold">{{ fileInfo.name }}</div>
          <div
            v-if="status.has('saved')"
            class="text-emerald-600 dark:text-emerald-300"
          >
            &nbsp;- successfully saved
          </div>
          <div
            v-else-if="status.has('edited')"
            class="text-gray-600 dark:text-gray-300"
          >
            &nbsp;- unsaved
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex w-full flex-grow flex-col place-content-start place-items-center px-8"
    >
      <div
        class="flex w-full flex-grow flex-col place-content-start place-items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
      >
        <NuxtPage class="w-full flex-grow" @status="setStatus" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, PencilIcon } from "@heroicons/vue/24/outline";
import { status as statusKey } from "./[file].provide";
const route = useRoute();

const perms = {
  view: h(EyeIcon, { class: "w-6 h-6" }),
  edit: h(PencilIcon, { class: "w-6 h-6" }),
};

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
