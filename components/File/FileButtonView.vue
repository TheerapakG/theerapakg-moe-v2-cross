<template>
  <button class="relative" @click="viewFile()">
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  fileId: string;
  mime: string;
}

const props = defineProps<Props>();

const viewFile = async () => {
  await navigateTo(`/file/view/mime/${props.mime}/${props.fileId}`);
};
</script>
