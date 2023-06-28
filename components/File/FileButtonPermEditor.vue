<template>
  <div
    class="relative inline-flex w-min place-content-center place-items-center gap-x-1"
  >
    <UPopover v-for="perm in perms" :key="perm">
      <slot :perm="perm">
        <UButton :label="`change permission ${perm}`" />
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
};

const props = defineProps<Props>();
const { fileId } = toRefs(props);

const perms = ["view", "edit"] as const;
</script>
