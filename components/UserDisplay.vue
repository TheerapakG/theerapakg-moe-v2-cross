<template>
  <Suspense>
    <template #fallback> loading... </template>
    <div class="flex place-content-center place-items-center">
      <div v-if="current.id === 'default'">
        not logged in
        <NuxtLink
          class="m-2 rounded-lg bg-black p-2 text-white dark:bg-white dark:text-black"
          to="/login"
        >
          login
        </NuxtLink>
      </div>
      <div v-else>
        user: {{ current.name }}
        <NuxtLink
          class="m-2 rounded-lg bg-black p-2 text-white dark:bg-white dark:text-black"
          to="/logout"
        >
          logout
        </NuxtLink>
      </div>
    </div>
  </Suspense>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const current = await userStore.useCurrent();
</script>
