<script setup lang="ts">
const route = useRoute();

await navigateTo({
  path: `/${(route.params.slug as string[]).join("/")}`,
  query: route.query,
});
</script>
