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
      try {
        const { host, pathname, searchParams, hash } = new URL(target);

        toastStore.spawn({
          title: "Redirecting...",
          description: `redirecting to ${target}`,
        });

        if (host === new URL(window.location.href).host) {
          await navigateTo({
            path: pathname,
            query: {
              ...searchParams[Symbol.iterator],
            },
            hash,
          });
        } else {
          window.location.href = target;
        }
      } catch (e) {
        if (e instanceof TypeError) {
          const { ExclamationCircleIcon } = await import(
            "@heroicons/vue/outline"
          );
          toastStore.spawn({
            title: "Redirection Error",
            description: "Malformed URL! Maybe try going back?",
            icon: h(ExclamationCircleIcon),
          });
        }
      }
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
