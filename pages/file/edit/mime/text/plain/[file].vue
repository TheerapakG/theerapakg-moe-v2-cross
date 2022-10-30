<script setup lang="ts">
const route = useRoute();
await navigateTo(`/file/edit/${route.params.file}/txt`);
</script>
