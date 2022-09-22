<template>
  <div></div>
</template>

<script setup lang="ts">
const route = useRoute();

const target = await $apiFetch(`/api/sh/${route.params.name}`);
const targetValue = "value" in target ? (target.value as string) : null;

onMounted(async () => {
  if (!targetValue) {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    const toastStore = useToastStore("layout");

    toastStore.spawn({
      title: "Redirection Error",
      description: "No shortened target! Maybe try going back?",
      icon: h(ExclamationCircleIcon),
    });
  } else {
    try {
      const { host, pathname, searchParams, hash } = new URL(targetValue);

      if (host === new URL(window.location.href).host) {
        await navigateTo({
          path: pathname,
          query: {
            ...searchParams[Symbol.iterator],
          },
          hash,
        });
      } else {
        await navigateTo({
          path: "/ext_redirect",
          query: {
            path: encodeURIComponent(targetValue),
          },
        });
      }
    } catch (e) {
      if (e instanceof TypeError) {
        const { ExclamationCircleIcon } = await import(
          "@heroicons/vue/outline"
        );
        const toastStore = useToastStore("layout");

        toastStore.spawn({
          title: "Redirection Error",
          description: "Malformed URL! Maybe try going back?",
          icon: h(ExclamationCircleIcon),
        });
      }
    }
  }
});
</script>
