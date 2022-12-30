<template>
  <div class="flex place-content-center place-items-center gap-2">
    <FileButtonPermEditor
      v-for="(estimatedPermUserCount, perm) in userCount"
      :key="perm"
      v-slot="{ permUserCount }"
      :file-id="fileId"
      :perm="perm"
      :user-count="estimatedPermUserCount"
    >
      <slot :perm="perm" :perm-user-count="permUserCount">
        <button>{{ perm }}: {{ permUserCount }} users</button>
      </slot>
    </FileButtonPermEditor>
  </div>
</template>

<script setup lang="ts">
import { TypedInternalResponse } from "nitropack";

interface Props {
  fileId: string;
  userCount: TypedInternalResponse<`/api/file/${string}/info`>["perms"]["count"];
}

defineProps<Props>();
</script>
