<script setup lang="ts">
await navigateTo(
  {
    path: "/redirect",
    query: {
      path: encodeURIComponent("https://explorer.harmony.one/tools/approvals"),
    },
  },
  {
    replace: true,
  }
);
</script>
