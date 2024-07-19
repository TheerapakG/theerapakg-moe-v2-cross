<script setup lang="ts">
definePageMeta({
  title: "theerapakg-moe-app: fill info",
  name: "Fill Info",
});

const tableColumns = [
  { key: "isv", label: "ISV" },
  { key: "talent", label: "Talent" },
  { key: "heal", label: "Heal" },
  { key: "lscorer", label: "LScorer(s)" },
];

const tableData = [
  { isv: "150/675", talent: "300k", heal: 0, lscorer: 2 },
  { isv: "120/560", talent: "160k", heal: 0, lscorer: 0 },
  { isv: "120/590", talent: "113k", heal: 0, lscorer: 3 },
  { isv: "85/555", talent: "117k", heal: 400, lscorer: 2 },
  { isv: "150/590", talent: "341k", heal: 0, lscorer: 1 },
];
</script>

<template>
  <div class="flex flex-col place-content-start place-items-center">
    <div class="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
      My Fill Team Stats
    </div>
    <UTable
      class="thin-scrollbars overflow-x-auto"
      :columns="tableColumns"
      :rows="tableData"
    />
  </div>
</template>
