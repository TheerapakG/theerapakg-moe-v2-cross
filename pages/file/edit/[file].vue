<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="mb-8 w-full px-8">
      <div v-if="pending">loading...</div>
      <div v-else-if="!fileInfo"></div>
      <div v-else class="relative w-full">
        <div class="absolute left-0 md:left-16">
          <portal-target name="file-menu-left" />
        </div>
        <div
          class="absolute right-0 flex place-content-center place-items-center gap-x-2"
        >
          <VDropdown
            :distance="8"
            :boundary="pageContainerDom"
            placement="bottom"
            theme="context-menu"
          >
            <button class="icon-button t-transition-default">
              <KeyIcon class="h-6 w-6" />
            </button>

            <template #popper>
              <div class="flex place-content-center place-items-center gap-2">
                <FileButtonPermEditorGroup
                  v-slot="{ perm, permUserCount }"
                  :file-id="(route.params.file as string)"
                  :user-count="fileInfo.perms"
                >
                  <button
                    class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
                  >
                    {{ permUserCount }}
                    <VNodeTemplate
                      :render-node="perms[perm as keyof typeof perms]"
                    />
                  </button>
                </FileButtonPermEditorGroup>
              </div>
            </template>
          </VDropdown>
          <FileButtonViewerMode
            :file-id="(route.params.file as string)"
            :mime="fileInfo?.mime"
          />
        </div>
        <div class="flex place-content-center place-items-center">
          <FileNameEditor
            class="list-move font-bold"
            :file-id="(route.params.file as string)"
            :name="fileInfo.name"
            :download="false"
          />
          <div class="list-move flex place-content-center place-items-center">
            <portal-target name="file-status" />
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
        <NuxtPage class="w-full flex-grow" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, KeyIcon, PencilIcon } from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { mountedKey } from "./provides";

provide(mountedKey, useMounted());

const route = useRoute();

const pageStore = usePageStore();

const { pageContainerDom } = storeToRefs(pageStore);

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
