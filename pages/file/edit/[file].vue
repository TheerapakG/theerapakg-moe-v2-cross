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
          class="absolute right-0 flex h-full place-content-center place-items-center gap-x-2"
        >
          <NuxtLink :to="`/file/download/${route.params.file}`">
            <button
              class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
            >
              <ArrowDownTrayIcon class="h-6 w-6" />
            </button>
          </NuxtLink>
          <VDropdown
            :distance="8"
            :boundary="pageContainerDom"
            placement="bottom"
            theme="context-menu"
            class="flex place-content-center place-items-center"
          >
            <button class="icon-button t-transition-default">
              <KeyIcon class="h-6 w-6" />
            </button>

            <template #popper>
              <div class="flex place-content-center place-items-center gap-2">
                <FileButtonPermEditorGroup
                  v-slot="{ perm, permUserCount }"
                  :file-id="(route.params.file as string)"
                  :user-count="fileInfo.perms.count"
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
            :perms="fileInfo?.perms.user"
          />
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
        class="flex w-full flex-grow flex-col place-content-start place-items-center rounded-lg bg-gray-300 p-4 dark:bg-gray-600"
      >
        <NuxtPage class="w-full flex-grow" />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { EyeIcon, KeyIcon, PencilIcon } from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { mountedKey } from "./provides";

provide(mountedKey, useMounted());

const route = useRoute();
const routeStore = useRouteStore();

const pageStore = usePageStore();

const { pageContainerDom } = storeToRefs(pageStore);

const perms = {
  view: <EyeIcon class="h-6 w-6" />,
  edit: <PencilIcon class="h-6 w-6" />,
};

const {
  pending,
  data: fileInfo,
  //error: fileInfoError,
} = await useApiFetch(`/api/file/${route.params.file}/info`);

routeStore.setTitle(
  computed(() => `theerapakg-moe-app: ${fileInfo.value?.name}`)
);
</script>
