<template>
  <div
    class="inline-flex w-min place-content-center place-items-center gap-x-1"
  >
    <FileButtonPermEditor
      v-for="(estimatedPermUserCount, perm) in userCount"
      :key="perm"
      v-slot="{ permUserCount }"
      :file-id="fileId"
      :perm="perm"
      :user-count="estimatedPermUserCount"
    >
      <slot :perm="perm" :perm-user-count="permUserCount">
        <UButton :label="`${perm}: ${permUserCount} users`" />
      </slot>
    </FileButtonPermEditor>
  </div>
</template>

<script setup lang="ts">
import type { FetchResult } from "nuxt/app";

type Props = {
  fileId: string;
  userCount: FetchResult<`/api/file/${string}/info`, "get">["perms"]["count"];
};

defineProps<Props>();
</script>
