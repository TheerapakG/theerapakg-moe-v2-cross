<script setup lang="ts">
const route = useRoute();
await navigateTo({
  path: `/file/edit/${route.params.file}/txt`,
  replace: true,
});
</script>

<template>
  <div></div>
</template>
