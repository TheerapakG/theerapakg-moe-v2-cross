<template>
  <div v-if="!current">loading...</div>
  <div v-else class="flex place-content-center place-items-center">
    <div
      v-if="current.id === 'default'"
      class="flex place-content-center place-items-center gap-x-2"
    >
      <div>not logged in</div>
      <UserLoginButton />
    </div>
    <div v-else class="flex place-content-center place-items-center gap-x-2">
      <div>user: {{ current.name }}</div>
      <UserLogoutButton />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: current } = useApiFetch("/api/user/current");
</script>
