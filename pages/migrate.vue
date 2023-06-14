<template>
  <div></div>
</template>

<script setup lang="ts">
await $apiFetch("/api/migrate", {
  method: "post",
});
</script>
