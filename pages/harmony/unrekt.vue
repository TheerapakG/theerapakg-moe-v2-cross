<script setup lang="ts">
await navigateTo(
  {
    path: "/ext_redirect",
    query: {
      path: encodeURIComponent("https://explorer.harmony.one/tools/approvals"),
    },
  },
  {
    replace: true,
  }
);
</script>
