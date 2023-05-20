<template>
  <div class="relative">
    <VDropdown
      :distance="8"
      :boundary="pageContainerDom"
      placement="bottom"
      theme="context-menu"
    >
      <slot />

      <template #popper>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-4"
        >
          <div
            class="mx-auto h-16 w-64 rounded-lg border-2 border-black dark:border-white"
          >
            <DropZone
              :check-dragging-data="checkDraggingData"
              effect="copy"
              @dropped-data="onDroppedData"
            />
          </div>
          <button class="button-default h-12 w-32" @click="uploadFile()">
            upload
          </button>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script setup lang="tsx">
import { storeToRefs } from "pinia";

type Props = {
  fileId: string;
};

const props = defineProps<Props>();

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const pageStore = usePageStore();
const toastStore = useToastStore("layout");

const { pageContainerDom } = storeToRefs(pageStore);

const file = shallowRef<File | null>(null);

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
  file.value = data?.[0]?.kind === "file" ? data[0].file : null;
};

const uploadFile = async () => {
  if (!file.value) return;

  const fileReader = new FileReader();
  fileReader.addEventListener("load", async (event) => {
    try {
      await $apiFetch(`/api/file/${props.fileId}/edit`, {
        method: "PUT",
        body: {
          content: event.target?.result,
        },
      });
    } catch {
      const { ExclamationCircleIcon } = await import(
        "@heroicons/vue/24/outline"
      );
      toastStore.spawn({
        title: "Upload Error",
        description: "Cannot upload",
        icon: <ExclamationCircleIcon />,
      });
      emit("refresh");
      return;
    }
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Upload Success",
      description: "Successfully uploaded",
      icon: <ExclamationCircleIcon />,
    });
    emit("refresh");
  });

  fileReader.readAsDataURL(file.value);
};
</script>
