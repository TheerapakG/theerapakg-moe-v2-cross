<template>
  <Suspense>
    <template #fallback> loading... </template>
    <div class="flex place-content-center place-items-center">
      <div v-if="current.id === 'default'">
        not logged in
        <NuxtLink class="button-default m-2 p-2 font-normal" to="/login">
          login
        </NuxtLink>
      </div>
      <div v-else>
        user: {{ current.name }}
        <NuxtLink class="button-default m-2 p-2 font-normal" to="/logout">
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
