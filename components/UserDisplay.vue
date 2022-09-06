<template>
  <div class="flex place-content-center place-items-center">
    <div v-if="current.id === 'default'">
      not logged in
      <NuxtLink
        class="rounded-lg p-2 m-2 bg-black dark:bg-white text-white dark:text-black"
        to="/login"
      >
        login
      </NuxtLink>
    </div>
    <div v-else>
      user: {{ current.name }}
      <NuxtLink
        class="rounded-lg p-2 m-2 bg-black dark:bg-white text-white dark:text-black"
        to="/logout"
      >
        logout
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const current = await userStore.useCurrent();
</script>
