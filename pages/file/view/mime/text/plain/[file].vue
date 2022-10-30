<script setup lang="ts">
const route = useRoute();
await navigateTo(`/file/view/${route.params.file}/txt`);
</script>
