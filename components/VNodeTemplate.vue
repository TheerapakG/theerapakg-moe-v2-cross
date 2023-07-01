<script setup lang="tsx">
import { cloneVNode, VNode } from "vue";

type Props = {
  renderNode: VNode;
  renderKey?: string | number | symbol;
  tag?: string;
};

const props = withDefaults(defineProps<Props>(), { renderKey: "", tag: "" });
const { renderNode, renderKey, tag } = toRefs(props);

const renderVNode = () =>
  cloneVNode(
    tag.value ? <tag.value>{renderNode.value}</tag.value> : renderNode.value,
    useAssign(
      renderKey.value
        ? {
            key: renderKey.value,
          }
        : {}
    )
  );
</script>

<template>
  <renderVNode />
</template>
