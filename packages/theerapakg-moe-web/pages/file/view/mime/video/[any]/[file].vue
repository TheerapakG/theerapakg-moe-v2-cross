<script setup lang="ts">
const route = useRoute();
await navigateTo({
  path: `/file/view/${route.params.file}/video`,
  replace: true,
});
</script>

<template>
  <div></div>
</template>
