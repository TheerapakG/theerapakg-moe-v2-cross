<template>
  <div ref="editerElement" class="text-left"></div>
</template>

<script setup lang="ts">
import type * as _monaco from "monaco-editor";

interface Props {
  options?: _monaco.editor.IStandaloneEditorConstructionOptions;
  override?: _monaco.editor.IEditorOverrideServices;
  commands?: {
    keybinding: number;
    handler: _monaco.editor.ICommandHandler;
    context?: string;
  }[];
}

const props = withDefaults(defineProps<Props>(), {
  options: null,
  override: null,
  commands: () => [],
});

const importStore = useImportStore();

const editerElement = ref<HTMLElement | null>(null);
const { width, height } = useElementSize(editerElement);

const editor = shallowRef<_monaco.editor.IStandaloneCodeEditor | null>(null);

watch([width, height], () =>
  editor.value?.layout({ width: width.value, height: height.value })
);

onMounted(async () => {
  const monaco = await importStore.useMonaco();

  editor.value = monaco.editor.create(
    editerElement.value,
    props.options,
    props.override
  );

  props.commands.map(({ keybinding, handler, context }) =>
    editor.value.addCommand(keybinding, handler, context)
  );
});

onUnmounted(() => {
  editor.value.dispose();
  editor.value = null;
});

defineExpose({ editor });
</script>
