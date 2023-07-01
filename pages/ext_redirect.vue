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

        const external = host !== useRequestURL().host;

        await navigateTo(
          {
            path: external ? target : pathname,
            query: external
              ? useFromPairs(
                  useToPairs(useGroupBy([...searchParams.entries()], 0)).map(
                    ([key, values]) => [
                      key,
                      values.length > 1
                        ? values.map((value) => value[1])
                        : values[0][1],
                    ]
                  )
                )
              : {},
            hash,
          },
          {
            replace: true,
            external,
          }
        );
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

<template>
  <div></div>
</template>
