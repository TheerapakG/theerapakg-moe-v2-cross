<template>
  <div class="relative">
    <VDropdown
      :distance="8"
      :boundary="pageContainerDom"
      placement="bottom"
      theme="context-menu"
      @show="open = true"
      @hide="open = false"
    >
      <slot />

      <template #popper>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-4"
        >
          <div>edit file</div>
          <div
            class="w-64 h-16 mx-auto rounded-lg border-2 border-black dark:border-white"
          >
            <DropZone
              :check-dragging-data="checkDraggingData"
              effect="copy"
              @dropped-data="onDroppedData"
            />
          </div>
          <button
            class="relative w-32 h-12 rounded-lg bg-black dark:bg-white text-white font-bold dark:text-black"
            @click="uploadFile()"
          >
            upload
          </button>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

interface Props {
  fileId: string;
}

const props = defineProps<Props>();

interface Emits {
  (event: "refresh"): void;
}

const emit = defineEmits<Emits>();

const pageStore = usePageStore();
const toastStore = useToastStore("layout");

const { pageContainerDom } = storeToRefs(pageStore);

const open = ref(false);

const file = shallowRef<File>(null);

const checkDraggingData = (
  data:
    | (
        | {
            kind: "string";
            type: string;
            cb: (cb: (s: string) => void) => void;
          }
        | {
            kind: "file";
            type: string;
            file: File;
          }
      )[]
    | null
) => {
  return data?.length === 1 && data[0].kind === "file";
};

const onDroppedData = (
  data:
    | (
        | {
            kind: "string";
            type: string;
            string: string;
          }
        | {
            kind: "file";
            type: string;
            file: File;
          }
      )[]
    | undefined
) => {
  file.value = data?.[0]?.kind === "file" ? data[0].file : undefined;
};

const uploadFile = async () => {
  const fileReader = new FileReader();
  fileReader.addEventListener("load", async (event) => {
    try {
      await $apiFetch(`/api/file/${props.fileId}/edit`, {
        method: "PUT",
        body: {
          content: event.target.result,
        },
      });
    } catch {
      const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
      toastStore.spawn({
        title: "Upload Error",
        description: "Cannot upload",
        icon: h(ExclamationCircleIcon),
      });
      emit("refresh");
      return;
    }
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    toastStore.spawn({
      title: "Upload Success",
      description: "Successfully uploaded",
      icon: h(ExclamationCircleIcon),
    });
    emit("refresh");
  });

  fileReader.readAsDataURL(file.value);
};
</script>
