<script setup lang="ts">
const route = useRoute();
await navigateTo({
  path: `/file/view/${route.params.file}/txt`,
  query: { language: "json" },
});
</script>
