<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div></div>
</template>

<script setup lang="ts">
const error = useError();

onMounted(() => {
  if (process.client) {
    try {
      const toastStore = useToastStore("layout");
      if (!isNuxtError(error.value) && !("message" in error.value)) {
        toastStore.spawn({
          title: "Error loading the page",
          description: "error encountered while loading the page",
        });
        throw undefined;
      }
      toastStore.spawn({
        title: "Error loading the page",
        description: error.value.message,
      });
    } catch {}

    console.log(error.value);
    clearError({ redirect: "/" });
  }
});
</script>
