<template>
  <MonacoEditor
    ref="monacoEditor"
    :options="{ fontLigatures: true, value: data }"
    :commands="commands"
  />
</template>

<script setup lang="ts">
import { status as statusKey } from "../[file].provide";
import MonacoEditor from "~/components/MonacoEditor.client.vue";

const route = useRoute();
const status = inject(statusKey);

const importStore = useImportStore();
const toastStore = useToastStore("layout");

const data = await $apiFetch(`/api/file/${route.params.file}/download`);

const monacoEditor = ref<InstanceType<typeof MonacoEditor>>(null);
const monacoModel = computed(() => monacoEditor.value?.editor?.getModel());
const lastSaveVersionId = ref<number>(null);

const resetLastSaveVersionId = () => {
  lastSaveVersionId.value = monacoModel.value?.getAlternativeVersionId?.();
};

const updateEditStatus = () => {
  if (
    monacoModel.value?.getAlternativeVersionId?.() === lastSaveVersionId.value
  )
    status.value.delete("edit");
  else status.value.add("edit");
};

// model or model.value.editor changed
watch(monacoModel, () => {
  resetLastSaveVersionId();
  monacoModel.value?.onDidChangeContent?.(updateEditStatus);
});

watch(lastSaveVersionId, updateEditStatus);

const save = async () => {
  const fileReader = new FileReader();

  fileReader.addEventListener("load", async (event) => {
    try {
      await $apiFetch(`/api/file/${route.params.file}/edit`, {
        method: "PUT",
        body: {
          content: event.target.result,
        },
      });
    } catch {
      const { ExclamationCircleIcon } = await import(
        "@heroicons/vue/24/outline"
      );
      toastStore.spawn({
        title: "Save Error",
        description: "Cannot save",
        icon: h(ExclamationCircleIcon),
      });
      return;
    }
    resetLastSaveVersionId();
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Save Success",
      description: "Successfully saved",
      icon: h(ExclamationCircleIcon),
    });
  });

  fileReader.readAsDataURL(new Blob([monacoEditor.value.editor.getValue()]));
};

let commands = [];

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
