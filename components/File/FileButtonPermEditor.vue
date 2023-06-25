<template>
  <div class="relative">
    <UPopover>
      <slot :perm-user-count="permUserCount">
        <UButton :label="`${permUserCount} users`" />
      </slot>

      <template #panel>
        <FilePermEditor :file-id="fileId" :perm="perm" class="p-4" />
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
type Props = {
  fileId: string;
  perm: "view" | "edit";
};

const props = defineProps<Props>();
const { fileId, perm } = toRefs(props);

const filePermStore = useFilePermStore();

const permUserCount = await filePermStore.fetchFilePermCountComputed(
  fileId,
  perm
);
</script>
