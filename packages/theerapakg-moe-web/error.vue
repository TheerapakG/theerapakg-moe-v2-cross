<script setup lang="ts">
const error = useError();

onMounted(() => {
  if (process.client) {
    try {
      const toast = useToast();
      if (
        !error.value ||
        (!isNuxtError(error.value) && !("message" in error.value))
      ) {
        toast.add({
          title: "Error loading the page",
          description: "error encountered while loading the page",
          color: "red",
        });
        throw undefined;
      }
      toast.add({
        title: "Error loading the page",
        description: error.value.message,
        color: "red",
      });
    } catch {}

    console.log(error.value);
    clearError({ redirect: "/" });
  }
});
</script>

<template>
  <div></div>
</template>
