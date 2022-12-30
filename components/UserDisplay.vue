<template>
  <Suspense>
    <template #fallback> loading... </template>
    <div class="flex place-content-center place-items-center">
      <div
        v-if="current.id === 'default'"
        class="flex place-content-center place-items-center"
      >
        <div>not logged in</div>
        <NuxtLink to="/login">
          <button
            title="login"
            class="button-default m-2 flex h-8 place-content-center place-items-center px-2 font-normal"
          >
            login
          </button>
        </NuxtLink>
      </div>
      <div v-else class="flex place-content-center place-items-center">
        <div>user: {{ current.name }}</div>
        <NuxtLink to="/logout">
          <button
            title="logout"
            class="button-default m-2 flex h-8 place-content-center place-items-center px-2 font-normal"
          >
            logout
          </button>
        </NuxtLink>
      </div>
    </div>
  </Suspense>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const current = await userStore.useCurrent();
</script>
