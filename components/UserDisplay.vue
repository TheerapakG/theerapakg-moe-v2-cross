<template>
  <Suspense>
    <template #fallback> loading... </template>
    <div class="flex place-content-center place-items-center">
      <div
        v-if="current.id === 'default'"
        class="flex place-content-center place-items-center gap-x-2"
      >
        <div>not logged in</div>
        <UButton label="login" to="/login" />
      </div>
      <div v-else class="flex place-content-center place-items-center gap-x-2">
        <div>user: {{ current.name }}</div>
        <UButton label="logout" to="/logout" />
      </div>
    </div>
  </Suspense>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const current = await userStore.useCurrent();
</script>
