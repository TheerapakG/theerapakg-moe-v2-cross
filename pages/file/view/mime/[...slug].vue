<script setup lang="ts">
const route = useRoute();
await navigateTo(
  `/file/view/${route.params.slug[route.params.slug.length - 1]}/txt`
);
</script>
