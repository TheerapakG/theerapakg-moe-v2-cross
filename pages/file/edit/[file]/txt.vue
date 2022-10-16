<template>
  <MonacoEditor
    ref="monacoEditor"
    :options="{ fontLigatures: true, value: data }"
    :commands="commands"
  />
</template>

<script setup lang="ts">
import MonacoEditor from "~/components/MonacoEditor.client.vue";

const route = useRoute();

const importStore = useImportStore();
const toastStore = useToastStore("layout");

const data = await $apiFetch(`/api/file/${route.params.file}/download`);

const monacoEditor = ref<InstanceType<typeof MonacoEditor>>(null);

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
