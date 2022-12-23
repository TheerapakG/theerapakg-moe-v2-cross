<template>
  <VDropdown
    :distance="8"
    :boundary="pageContainerDom"
    placement="bottom"
    theme="context-menu"
  >
    <button
      class="button-default flex h-8 place-content-center place-items-center p-2"
    >
      edit / view
    </button>

    <template #popper>
      <div
        class="flex flex-col place-content-center place-items-center gap-y-2"
      >
        <button
          class="icon-button t-transition-default grid grid-cols-[1.5rem_4rem] place-content-center place-items-center"
          @click="viewFile('view')"
        >
          <EyeIcon class="h-6 w-6" />
          <div>view</div>
        </button>
        <button
          class="icon-button t-transition-default grid grid-cols-[1.5rem_4rem] place-content-center place-items-center"
          @click="viewFile('edit')"
        >
          <PencilIcon class="h-6 w-6" />
          <div>edit</div>
        </button>
      </div>
    </template>
  </VDropdown>
</template>

<script setup lang="ts">
import { EyeIcon, PencilIcon } from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import MimeType from "whatwg-mimetype";

interface Props {
  fileId: string;
  mime: string;
}

const props = defineProps<Props>();

const pageStore = usePageStore();

const { pageContainerDom } = storeToRefs(pageStore);

const viewFile = async (mode: "edit" | "view") => {
  const mimeType = new MimeType(props.mime);
  await navigateTo({
    path: `/file/${mode}/mime/${mimeType.type}/${mimeType.subtype}/${props.fileId}`,
    query: Object.fromEntries(mimeType.parameters),
  });
};
</script>
