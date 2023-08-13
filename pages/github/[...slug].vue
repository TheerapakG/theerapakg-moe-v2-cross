<script setup lang="ts">
definePageMeta({
  title: "theerapakg-moe-app",
  name: "GitHub",
});

const route = useRoute();

const slug =
  route.params.slug.length > 0
    ? `/${(route.params.slug as string[]).join("/")}`
    : "";

const query = isEmpty(route.query)
  ? ""
  : `?${Object.entries(route.query)
      .map(([key, value]) =>
        value === null
          ? key
          : Array.isArray(value)
          ? value.map((v) => `${key}=${v}`).join("&")
          : `${key}=${value}`,
      )
      .join("&")}`;

await navigateTo(
  {
    path: "/redirect",
    query: {
      path: encodeURIComponent(`https://github.com/TheerapakG${slug}${query}`),
    },
  },
  {
    replace: true,
  },
);
</script>
