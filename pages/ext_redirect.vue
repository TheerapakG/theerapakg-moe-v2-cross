<template>
  <div></div>
</template>

<script setup lang="tsx">
definePageMeta({
  title: "redirecting...",
  pageTransition: {
    name: "slide-left-uni",
    mode: "out-in",
  },
});

const route = useRoute();

const toast = useToast();

const target = route.query.path
  ? decodeURIComponent(route.query.path as string)
  : null;

onMounted(async () => {
  if (process.client) {
    if (target) {
      try {
        const { host, pathname, searchParams, hash } = new URL(target);

        toast.add({
          title: "Redirecting...",
          description: `redirecting to ${target}`,
        });

        if (host === new URL(window.location.href).host) {
          await navigateTo(
            {
              path: pathname,
              query: {
                ...searchParams[Symbol.iterator],
              },
              hash,
            },
            {
              replace: true,
            }
          );
        } else {
          window.location.replace(target);
        }
      } catch (e) {
        if (e instanceof TypeError) {
          toast.add({
            title: "Redirection Error",
            description: "Malformed URL! Maybe try going back?",
            icon: "i-heroicons-exclaimation-circle",
            color: "red",
          });
        }
      }
    } else {
      toast.add({
        title: "Redirection Error",
        description: "No redirection target! Maybe try going back?",
        icon: "i-heroicons-exclaimation-circle",
        color: "red",
      });
    }
  }
});
</script>
