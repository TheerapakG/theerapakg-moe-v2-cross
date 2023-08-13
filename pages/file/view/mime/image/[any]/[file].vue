<script setup lang="ts">
const route = useRoute();
await navigateTo({
  path: `/file/view/${route.params.file}/img`,
  replace: true,
});
</script>

<template>
  <div></div>
</template>
