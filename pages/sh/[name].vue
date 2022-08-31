<script setup lang="ts">
const route = useRoute();

await navigateTo({
  path: "/ext_redirect",
  query: {
    path: encodeURIComponent(
      (
        await $fetch(`/api/sh/${route.params.name}`)
      ).value
    ),
  },
});
</script>
