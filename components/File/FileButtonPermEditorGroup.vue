<template>
  <div
    class="inline-flex w-min place-content-center place-items-center gap-x-1"
  >
    <FileButtonPermEditor
      v-for="perm in (['view', 'edit'] as const)"
      :key="perm"
      v-slot="{ permUserCount }"
      :file-id="fileId"
      :perm="perm"
    >
      <slot :perm="perm" :perm-user-count="permUserCount">
        <UButton
          :label="`${perm}: ${
            permUserCount === undefined ? '(loading...)' : permUserCount
          } users`"
        />
      </slot>
    </FileButtonPermEditor>
  </div>
</template>

<script setup lang="ts">
type Props = {
  fileId: string;
};

defineProps<Props>();
</script>
