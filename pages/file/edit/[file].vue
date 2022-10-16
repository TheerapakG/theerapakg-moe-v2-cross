<template>
  <div class="flex h-full flex-col">
    <div>{{ file }}</div>
    <NuxtPage class="flex-grow" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const file = ref(route.params.file as string);
</script>
