<template>
  <div ref="editerElement" class="text-left"></div>
</template>

<script setup lang="ts">
import type * as _monaco from "monaco-editor";

interface Props {
  options?: _monaco.editor.IStandaloneEditorConstructionOptions;
  override?: _monaco.editor.IEditorOverrideServices;
}

const props = defineProps<Props>();
const { options, override } = toRefs(props);

const editerElement = ref<HTMLElement | null>(null);
const editor = shallowRef<_monaco.editor.IStandaloneCodeEditor | null>(null);

onMounted(async () => {
  if (process.client) {
    const monaco = await import("monaco-editor");
    editor.value = monaco.editor.create(
      editerElement.value,
      options.value,
      override.value
    );
  }
});
</script>
