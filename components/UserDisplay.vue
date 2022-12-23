<template>
  <Suspense>
    <template #fallback> loading... </template>
    <div class="flex place-content-center place-items-center">
      <div
        v-if="current.id === 'default'"
        class="flex place-content-center place-items-center"
      >
        <div>not logged in</div>
        <NuxtLink
          class="button-default m-2 flex h-8 place-content-center place-items-center px-2 font-normal"
          to="/login"
        >
          <div>login</div>
        </NuxtLink>
      </div>
      <div v-else class="flex place-content-center place-items-center">
        <div>user: {{ current.name }}</div>
        <NuxtLink
          class="button-default m-2 flex h-8 place-content-center place-items-center px-2 font-normal"
          to="/logout"
        >
          <div>logout</div>
        </NuxtLink>
      </div>
    </div>
  </Suspense>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const current = await userStore.useCurrent();
</script>
