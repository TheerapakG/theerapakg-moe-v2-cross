<template>
  <div class="flex place-content-center place-items-center gap-2">
    <FileButtonPermEditor
      v-for="(estimatedPermUserCount, perm) in userCount"
      :key="perm"
      v-slot="{ permUserCount }"
      :file-id="fileId"
      :perm="(perm as string)"
      :user-count="estimatedPermUserCount"
    >
      <slot :perm="perm" :perm-user-count="permUserCount">
        <button>{{ perm }}: {{ permUserCount }} users</button>
      </slot>
    </FileButtonPermEditor>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fileId: string;
  userCount: { [perm: string]: number };
}

defineProps<Props>();
</script>
