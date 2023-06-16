<template>
  <div v-if="!current">loading...</div>
  <div v-else class="flex place-content-center place-items-center">
    <div
      v-if="current.id === '00000000-0000-0000-0000-000000000000'"
      class="flex place-content-center place-items-center gap-x-2"
    >
      <div>not logged in</div>
      <UserLoginButton />
    </div>
    <div v-else class="flex place-content-center place-items-center gap-x-2">
      <div>user: {{ current.data?.name ?? "(loading...)" }}</div>
      <UserLogoutButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { current } = storeToRefs(userStore);
await userStore.fetchCurrent();
</script>
