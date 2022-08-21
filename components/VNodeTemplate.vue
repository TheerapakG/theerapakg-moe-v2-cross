<template>
  <renderVNode />
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneVNode, VNode } from "vue";

interface Props {
  renderNode: VNode;
  renderKey?: string | number | symbol;
  tag?: string;
}

const props = withDefaults(defineProps<Props>(), { renderKey: "", tag: "" });
const { renderNode, renderKey, tag } = toRefs(props);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const renderVNode = () =>
  cloneVNode(
    tag.value ? h(tag.value, [renderNode.value]) : renderNode.value,
    useAssign(
      renderKey.value
        ? {
            key: renderKey.value,
          }
        : {}
    )
  );
</script>
