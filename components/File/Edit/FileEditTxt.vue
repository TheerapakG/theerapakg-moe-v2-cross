<template>
  <div class="relative">
    <ClientOnly>
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
          <button
            class="icon-button t-transition-default"
            :disabled="!status.has('edited')"
            @click="save"
          >
            <CloudArrowUpIcon class="h-6 w-6" />
          </button>
          <FileRun :file-id="fileId" />
        </div>
      </portal>
      <portal v-if="activatePortal" to="file-status">
        <Transition name="pop" mode="out-in">
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
        </Transition>
      </portal>
    </ClientOnly>
  </div>
</template>

<script setup lang="tsx">
import CloudArrowUpIcon from "@heroicons/vue/24/outline/CloudArrowUpIcon";
import MonacoEditor from "~/components/MonacoEditor.client.vue";

interface Props {
  fileId: string;
  lang?: string;
  activatePortal?: boolean;
}

const props = defineProps<Props>();

const data = await $apiFetch<string>(`/api/file/${props.fileId}/download`, {
  responseType: "text",
});

const status = ref(new Set<string>());

const importStore = useImportStore();
const toastStore = useToastStore("layout");

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
        title: "Save Error",
        description: "Cannot save",
        icon: <ExclamationCircleIcon />,
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
