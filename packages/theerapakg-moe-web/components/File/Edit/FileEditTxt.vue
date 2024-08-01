<script setup lang="ts">
import MonacoEditor from "~/components/MonacoEditor.client.vue";
import { ofetch } from "ofetch";

type Props = {
  fileId: string;
  lang?: string;
  activatePortal?: boolean;
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const fileStore = useFileStore();

const { data: fileInfo } = await useAsyncData(
  () => fileStore.fetchFile(fileId.value),
  {
    watch: [fileId],
  },
);

const { data } = await useAsyncData(
  async () => {
    const url = fileInfo.value?.url;
    if (!url) return;
    return await ofetch(url, {
      responseType: "text",
    });
  },
  {
    watch: [fileInfo],
  },
);

const status = ref(new Set<string>());

const importStore = useImportStore();
const toast = useToast();

const monacoEditor = ref<InstanceType<typeof MonacoEditor> | null>(null);
const monacoModel = computed(() => monacoEditor.value?.editor?.getModel());
const lastSaveVersionId = ref<number | null>(null);

const resetLastSaveVersionId = () => {
  lastSaveVersionId.value =
    monacoModel.value?.getAlternativeVersionId?.() ?? null;
};

const updateEditStatus = () => {
  if (
    monacoModel.value?.getAlternativeVersionId?.() === lastSaveVersionId.value
  )
    status.value.delete("edited");
  else {
    status.value.delete("saved");
    status.value.add("edited");
  }
};

// model or model.value.editor changed
watch(monacoModel, () => {
  resetLastSaveVersionId();
  monacoModel.value?.onDidChangeContent?.(updateEditStatus);
});

watch(lastSaveVersionId, updateEditStatus);

const save = async () => {
  if (!monacoEditor.value?.editor) return;

  const fileReader = new FileReader();

  fileReader.addEventListener("load", async (event) => {
    try {
      await fileStore.editFile(fileId.value, event.target?.result as string);
    } catch {
      toast.add({
        title: "Save Error",
        description: "Cannot save",
        icon: "i-heroicons-exclaimation-circle",
        color: "red",
      });
      return;
    }
    resetLastSaveVersionId();
    status.value.add("saved");
  });

  fileReader.readAsDataURL(new Blob([monacoEditor.value.editor.getValue()]));
};

let commands: { keybinding: number; handler: () => unknown }[] = [];

if (process.client) {
  const monaco = await importStore.useMonaco();
  commands = [
    {
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      handler: save,
    },
  ];
}
</script>

<template>
  <div class="relative">
    <ClientOnly v-if="data">
      <MonacoEditor
        ref="monacoEditor"
        class="absolute inset-0"
        :options="{
          fontLigatures: true,
          value: data,
          ...(lang && { language: lang as string }),
        }"
        :commands="commands"
      />
      <portal v-if="activatePortal" to="file-menu-left">
        <div class="flex place-content-center place-items-center gap-2">
          <UButton
            variant="ghost"
            size="xl"
            icon="i-heroicons-cloud-arrow-up"
            :disabled="!status.has('edited')"
            :ui="{ rounded: 'rounded-full' }"
            @click="save"
          />
          <FileRun :file-id="fileId" />
        </div>
      </portal>
      <portal v-if="activatePortal" to="file-status">
        <TransitionPop mode="out-in">
          <div
            v-if="status.has('edited')"
            class="text-amber-600 dark:text-amber-300"
          >
            &nbsp;- modified
          </div>
          <div
            v-else-if="status.has('saved')"
            class="text-emerald-600 dark:text-emerald-300"
          >
            &nbsp;- saved
          </div>
        </TransitionPop>
      </portal>
    </ClientOnly>
  </div>
</template>
