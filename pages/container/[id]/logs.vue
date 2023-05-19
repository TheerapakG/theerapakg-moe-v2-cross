<template>
  <div class="px-8 md:px-24">
    <ContainerLogs :container-id="containerId" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const containerId = route.params.id as string;
</script>
