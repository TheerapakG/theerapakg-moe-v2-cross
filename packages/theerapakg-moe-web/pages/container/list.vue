<script setup lang="ts">
definePageMeta({
  title: "theerapakg-moe-app: container manager",
  name: "Container Manager",
  perms: ["container:list"],
});

const route = useRoute();

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 10;
const size = ref(isNaN(_size) ? 10 : _size);

const {
  pending: pendingCount,
  data: rawContainerCount,
  refresh: refreshCount,
} = await useApiFetch("/api/container/count");

const params = computed(() => {
  return {
    page: page.value,
    size: size.value,
  };
});

watch(params, async () => {
  if (!isNaN(params.value.page) && !isNaN(params.value.size)) {
    await navigateTo({
      path: route.path,
      query: {
        page: params.value.page,
        size: params.value.size,
      },
      replace: true,
    });
  }
});

const {
  pending: pendingList,
  data: rawContainerList,
  refresh: refreshList,
} = await useApiFetch("/api/container/list", {
  params,
});

const pending = computed(() => pendingCount.value || pendingList.value);
const refresh = async () => await Promise.all([refreshCount(), refreshList()]);

const containerQueryCount = computed(() => rawContainerCount.value?.count ?? 0);
const containerList = computed(() => rawContainerList.value?.containers ?? []);

const tableColumns = [
  { key: "id", label: "ID" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const tableData = computed(() =>
  useMap(containerList.value, ({ id, state }) => {
    return {
      id: id,
      status: state.status,
    };
  }),
);

const { pageCount } = useOffsetPagination({
  total: containerQueryCount,
  page,
  pageSize: size,
});
</script>

<template>
  <div class="relative">
    <TransitionFade>
      <LoadingCircleOverlay v-if="pending" />
      <UContainer v-else class="thin-scrollbars overflow-x-auto">
        <UTable :columns="tableColumns" :rows="tableData">
          <template #actions-data="{ row }">
            <ContainerButtonAction
              class="inline-flex h-8 w-8 place-content-center place-items-center"
              :container-id="row.id"
              @delete="refresh"
            />
          </template>
        </UTable>
      </UContainer>
    </TransitionFade>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </div>
</template>
