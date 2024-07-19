<script setup lang="ts">
const userStore = useUserStore();
const current = await userStore.fetchCurrentComputed();
</script>

<template>
  <div>
    <div class="flex place-content-center place-items-center gap-x-2">
      <USkeleton v-if="!current" class="h-4 w-32" />
      <div
        v-else-if="current.id === '00000000-0000-0000-0000-000000000000'"
        class="w-32"
      >
        not logged in
      </div>
      <div
        v-else
        class="flex w-32 place-content-center place-items-center gap-x-1"
      >
        <div>user:</div>
        <div v-if="current.data?.name">{{ current.data.name }}</div>
        <USkeleton v-else class="h-4 flex-grow" />
      </div>

      <USkeleton v-if="!current" class="h-8 w-16" />
      <div
        v-else-if="current.id === '00000000-0000-0000-0000-000000000000'"
        class="h-8 w-16"
      >
        <UserLoginButton />
      </div>
      <div v-else class="h-8 w-16">
        <UserLogoutButton />
      </div>
    </div>
  </div>
</template>
