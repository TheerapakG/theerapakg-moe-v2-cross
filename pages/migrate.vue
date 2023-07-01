<script setup lang="ts">
await $apiFetch("/api/migrate", {
  method: "post",
});
</script>

<template>
  <div></div>
</template>
