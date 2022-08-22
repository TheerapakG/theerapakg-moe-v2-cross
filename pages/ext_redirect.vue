<template>
  <div></div>
</template>

<script setup lang="ts">
const route = useRoute();

const toastStore = useToastStore("layout");

const target = route.query.path
  ? decodeURIComponent(route.query.path as string)
  : null;

onMounted(async () => {
  if (process.client) {
    if (target) {
      toastStore.spawn({
        title: "Redirecting...",
        description: `redirecting to ${target}`,
      });
      window.location.href = target;
    } else {
      const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
      toastStore.spawn({
        title: "Redirection Error",
        description: "No redirection target! Maybe try going back?",
        icon: h(ExclamationCircleIcon),
      });
    }
  }
});
</script>
