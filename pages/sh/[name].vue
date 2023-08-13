<script setup lang="ts">
definePageMeta({
  title: "redirecting...",
});

const route = useRoute();

const target = await $apiFetch(`/api/sh/name/${route.params.name}`);
const targetValue = "value" in target ? (target.value as string) : null;

onMounted(async () => {
  if (!targetValue) {
    const toastStore = useToast();

    toastStore.add({
      title: "Redirection Error",
      description: "No shortened target! Maybe try going back?",
      icon: "i-heroicons-exclaimation-circle",
    });
  } else {
    await navigateTo(
      {
        path: "/redirect",
        query: {
          path: encodeURIComponent(targetValue),
        },
      },
      {
        replace: true,
      },
    );
  }
});
</script>

<template>
  <div></div>
</template>
