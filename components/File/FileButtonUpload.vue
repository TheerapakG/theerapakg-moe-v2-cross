<template>
  <div class="relative">
    <UPopover>
      <slot>
        <UButton
          variant="ghost"
          size="xl"
          icon="i-heroicons-cloud-arrow-up"
          :aria-label="ariaLabel"
          :ui="{ rounded: 'rounded-full' }"
        />
      </slot>

      <template #panel>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-4 p-4"
        >
          <div
            class="mx-auto h-16 w-64 rounded-lg border-2 border-gray-500 dark:border-gray-400"
          >
            <DropZone
              :check-dragging-data="checkDraggingData"
              effect="copy"
              @dropped-data="onDroppedData"
            />
          </div>
          <UButton label="upload" @click="uploadFile()" />
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="tsx">
type Props = {
  fileId: string;
  ariaLabel?: string;
};

const props = defineProps<Props>();

type Emits = {
  refresh: [];
};

const emit = defineEmits<Emits>();

const toast = useToast();

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
      toast.add({
        title: "Upload Error",
        description: "Cannot upload",
        icon: "i-heroicons-exclaimation-circle",
        color: "red",
      });
      emit("refresh");
      return;
    }
    toast.add({
      title: "Upload Success",
      description: "Successfully uploaded",
      icon: "i-heroicons-exclaimation-circle",
    });
    emit("refresh");
  });

  fileReader.readAsDataURL(file.value);
};
</script>
