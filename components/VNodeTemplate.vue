<script setup lang="tsx">
import { cloneVNode, VNode } from "vue";

type Props = {
  node: VNode;
};

const props = defineProps<Props>();
const { node } = toRefs(props);

const renderVNode = () => cloneVNode(node.value);
</script>

<template>
  <renderVNode />
</template>
