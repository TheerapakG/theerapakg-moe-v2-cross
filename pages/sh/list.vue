<template>
  <UContainer
    class="thin-scrollbars relative flex flex-col gap-y-2 overflow-x-auto pt-0 md:pt-16 2xl:pt-0"
  >
    <UInput v-model="shSearch" class="w-full" size="md">
      <template #leading>
        <UIcon
          :name="
            pending ? 'i-heroicons-arrow-path' : 'i-heroicons-magnifying-glass'
          "
          :class="{ 'animate-spin': pending }"
        />
      </template>
    </UInput>
    <UTable
      class="thin-scrollbars overflow-x-auto"
      :columns="tableColumns"
      :rows="tableData"
    >
      <template #from-data="{ row }">
        <ShFromEditor
          v-if="row.data"
          class="w-64"
          :from="row.from"
          @refresh="refresh"
        />
        <UInput v-else v-model="newSh" />
      </template>
      <template #to-data="{ row }">
        <ShToEditor
          v-if="row.data"
          class="w-[40rem]"
          :from="row.from"
          :to="row.to"
          @refresh="refresh"
        />
        <UInput v-else v-model="newTarget" />
      </template>
      <template #actions-data="{ row }">
        <div
          class="inline-flex h-8 w-min place-content-center place-items-center gap-x-1"
        >
          <UButton
            v-if="row.data"
            variant="ghost"
            size="xl"
            icon="i-heroicons-minus"
            :ui="{ rounded: 'rounded-full' }"
            @click="removeSh(row.from)"
          />
          <UButton
            v-else
            variant="ghost"
            size="xl"
            icon="i-heroicons-plus"
            :ui="{ rounded: 'rounded-full' }"
            @click="addSh"
          />
        </div>
      </template>
    </UTable>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </UContainer>
</template>

<script setup lang="ts">
import { LocationQueryValue } from "vue-router";

definePageMeta({
  title: "theerapakg-moe-app: shortener manager",
  name: "Shortener Manager",
  perms: ["perms:sh:list"],
});

const route = useRoute();

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 10;
const size = ref(isNaN(_size) ? 10 : _size);

const shSearch = ref((route.query.q as LocationQueryValue) ?? "");
const shSearchDebounced = refDebounced(shSearch, 300);

watch([page, size, shSearchDebounced], async () => {
  if (!isNaN(page.value) && !isNaN(size.value)) {
    await navigateTo({
      path: route.path,
      query: {
        page: page.value,
        size: size.value,
        ...(shSearchDebounced.value && { q: shSearchDebounced.value }),
      },
      replace: true,
    });
  }
});

const params = computed(() => {
  return {
    page: page.value,
    size: size.value,
    ...(shSearchDebounced.value && { sh: shSearchDebounced.value }),
  };
});
const {
  pending,
  data: rawShListData,
  refresh,
} = await useApiFetch("/api/sh/list", {
  params,
});

const shQueryCount = computed(() => rawShListData.value?.queryCount ?? 0);
const shList = computed(() => rawShListData.value?.sh ?? []);

const tableColumns = [
  { key: "from", label: "From" },
  { key: "to", label: "To" },
  { key: "actions", label: "Actions" },
];

const tableData = computed(() => [
  ...useMap(shList.value, ({ from, to }) => {
    return {
      from,
      to,
      data: true,
    };
  }),
  { data: false },
]);

const { pageCount } = useOffsetPagination({
  total: shQueryCount,
  page,
  pageSize: size,
});

const newSh = ref("");
const newTarget = ref("");

const addSh = async () => {
  await $apiFetch(`/api/sh/name/${newSh.value}`, {
    method: "PUT",
    params: {
      target: encodeURIComponent(newTarget.value),
    },
  });
  await refresh();
};

const removeSh = async (sh: string) => {
  await $apiFetch(`/api/sh/name/${sh}`, {
    method: "DELETE",
  });
  await refresh();
};
</script>
