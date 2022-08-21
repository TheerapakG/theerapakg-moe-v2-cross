<script setup lang="ts">
await navigateTo({
  path: "/ext_redirect",
  query: {
    path: encodeURI("https://explorer.harmony.one/tools/approvals"),
  },
});
</script>
