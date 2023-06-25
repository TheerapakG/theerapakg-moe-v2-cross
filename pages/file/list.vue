<template>
  <UContainer
    class="thin-scrollbars relative flex flex-col gap-y-2 overflow-x-auto pt-0 md:pt-16 2xl:pt-0"
  >
    <UInput v-model="fileSearch" class="w-full" size="md">
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
      <template #name-data="{ row }">
        <div
          class="flex min-w-[16rem] max-w-[32rem] place-content-center place-items-center"
        >
          <USkeleton v-if="!row.name" class="h-4 w-full" />
          <FileNameEditor
            v-else
            class="w-full"
            :file-id="row.id"
            :name="row.name"
          />
        </div>
      </template>
      <template #size-data="{ row }">
        <div class="inline-flex w-16 place-content-center place-items-center">
          <USkeleton v-if="!row.size" class="h-4 w-full" />
          <div v-else class="w-full">{{ row.size }}</div>
        </div>
      </template>
      <template #owner-data="{ row }">
        <div
          class="inline-flex h-8 w-28 place-content-center place-items-center"
        >
          <USkeleton v-if="!row.owner" class="h-4 w-full" />
          <div v-else>{{ row.owner }}</div>
        </div>
      </template>
      <template #perms-data="{ row }">
        <FileButtonPermEditorGroup
          v-slot="{ perm, permUserCount }"
          class="h-8"
          :file-id="row.id"
        >
          <UButton
            variant="ghost"
            size="xl"
            :trailing-icon="perms[perm]"
            :label="`${permUserCount === undefined ? '...' : permUserCount}`"
            :ui="{ rounded: 'rounded-full' }"
          />
        </FileButtonPermEditorGroup>
      </template>
      <template #actions-data="{ row }">
        <div
          class="inline-flex h-8 w-min place-content-center place-items-center gap-x-1"
        >
          <FileButtonView :file-id="row.id" :aria-label="`view ${row.name}`" />
          <FileButtonEdit :file-id="row.id" :aria-label="`edit ${row.name}`" />
          <FileButtonUpload
            :file-id="row.id"
            :aria-label="`upload ${row.name}`"
          />
          <UButton
            variant="ghost"
            size="xl"
            icon="i-heroicons-arrow-down-tray"
            :aria-label="`download ${row.name}`"
            :ui="{ rounded: 'rounded-full' }"
            :to="`/file/download/${row.id}`"
          />
          <FileButtonDelete
            :file-id="row.id"
            :aria-label="`delete ${row.name}`"
            @delete="refresh"
          />
        </div>
      </template>
    </UTable>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </UContainer>
</template>

<script setup lang="ts">
import defu from "defu";
import { LocationQueryValue } from "vue-router";
import { formatPretty } from "~/utils/formatPretty";

definePageMeta({
  title: "theerapakg-moe-app: files",
  name: "File Manager",
  perms: ["file:list"],
});

const route = useRoute();
const userStore = useUserStore();
const fileStore = useFileStore();

const perms = {
  view: "i-heroicons-eye",
  edit: "i-heroicons-pencil",
};

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 10;
const size = ref(isNaN(_size) ? 10 : _size);

const fileSearch = ref((route.query.q as LocationQueryValue) ?? "");
const fileSearchDebounced = refDebounced(fileSearch, 300);

const params = computed(() => {
  return defu(
    fileSearchDebounced.value ? { file: fileSearchDebounced.value } : undefined,
    { page: page.value, size: size.value }
  );
});

watch(params, async () => {
  if (!isNaN(params.value.page) && !isNaN(params.value.size)) {
    await navigateTo({
      path: route.path,
      query: defu(params.value.file ? { q: params.value.file } : undefined, {
        page: params.value.page,
        size: params.value.size,
      }),
      replace: true,
    });
  }
});

const {
  pending,
  data: rawFileList,
  refresh,
} = await useApiFetch("/api/file/list", {
  params,
});

const fileQueryCount = computed(() => rawFileList.value?.count ?? 0);

const infoFileList = await useAsyncMap(
  computed(() => rawFileList.value?.files),
  async (id) => {
    const info = await fileStore.fetchFileComputed(id);
    return computed(() => {
      return {
        id: toValue(id),
        info: info.value,
      };
    });
  }
);

const ownerFileList = await useAsyncMap(infoFileList, async (file) => {
  const { id, info } = toValue(file);
  const ownerInfo = info
    ? await userStore.fetchUserComputed(info.owner)
    : undefined;
  return computed(() => {
    return {
      id,
      info: info
        ? {
            name: info.name,
            owner: {
              id: info.owner,
              info: ownerInfo?.value,
            },
            size: info.size,
          }
        : info,
    };
  });
});

const tableColumns = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size (Bytes)" },
  { key: "owner", label: "Owner" },
  { key: "perms", label: "Perms" },
  { key: "actions", label: "Actions" },
];

const tableData = computed(() =>
  useMap(ownerFileList.value, (file) => {
    const { id, info } = toValue(file);
    return {
      id,
      name: info?.name,
      owner: info?.owner?.info?.name,
      size: info ? formatPretty(info?.size) : undefined,
    };
  })
);

const { pageCount } = useOffsetPagination({
  total: fileQueryCount,
  page,
  pageSize: size,
});
</script>
