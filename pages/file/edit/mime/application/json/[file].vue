<script setup lang="ts">
const route = useRoute();
await navigateTo({
  path: `/file/edit/${route.params.file}/txt`,
  query: { lang: "json" },
});
</script>
