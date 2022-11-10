<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 w-full px-8">
      <div v-if="pending">loading...</div>
      <div v-else class="relative w-full">
        <div id="file-menu-left" class="absolute left-0 md:left-16"></div>
        <div class="absolute right-0">
          <div class="flex place-content-center place-items-center gap-2">
            <FileButtonPermEditorGroup
              v-slot="{ perm, permUserCount }"
              :file-id="(route.params.file as string)"
              :user-count="fileInfo.perms"
            >
              <button
                class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
              >
                {{ permUserCount }} <VNodeTemplate :render-node="perms[perm]" />
              </button>
            </FileButtonPermEditorGroup>
          </div>
        </div>
        <div class="flex place-content-center place-items-center">
          <FileNameEditor
            class="list-move font-bold"
            :file-id="(route.params.file as string)"
            :name="fileInfo.name"
            :download="false"
          />
          <div
            id="file-status"
            class="list-move flex place-content-center place-items-center"
          ></div>
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
import { EyeIcon, PencilIcon } from "@heroicons/vue/24/outline";
const route = useRoute();

const perms = {
  view: h(EyeIcon, { class: "w-6 h-6" }),
  edit: h(PencilIcon, { class: "w-6 h-6" }),
};

const {
  pending,
  data: fileInfo,
  //error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);
</script>
