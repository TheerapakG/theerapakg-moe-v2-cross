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
        <FileButtonPermEditor v-slot="{ perm }" class="h-8" :file-id="row.id">
          <UButton
            variant="ghost"
            size="xl"
            :trailing-icon="perms[perm]"
            :label="`${
              row.perm?.count?.[perm] === undefined
                ? '...'
                : row.perm.count[perm]
            }`"
            :ui="{ rounded: 'rounded-full' }"
          />
        </FileButtonPermEditor>
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
const filePermStore = useFilePermStore();

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
const fileList = computed(() => rawFileList.value?.files ?? []);

const fileInfos = await fileStore.fetchFilesComputed(fileList);
const permUserCountInfos = await filePermStore.fetchFilePermCountsComputed(
  fileList
);

const owners = computed(() => fileInfos.value.map((file) => file.value.owner));
const ownerInfos = await userStore.fetchUsersComputed(owners);

const ownerFileList = computed(() =>
  [permUserCountInfos.value.length, ownerInfos.value.length].every(
    (len) => len === fileInfos.value.length
  )
    ? useZipWith(
        fileInfos.value,
        permUserCountInfos.value,
        ownerInfos.value,
        (fileInfo, permUserCountInfo, ownerInfo) =>
          computed(() => {
            const _fileInfo = toValue(fileInfo);
            return {
              id: _fileInfo.id,
              info: {
                name: _fileInfo.name,
                owner: {
                  id: _fileInfo.owner,
                  info: ownerInfo.value,
                },
                perm: {
                  count: permUserCountInfo.value.count,
                },
                size: _fileInfo.size,
              },
            };
          })
      )
    : []
);

const tableColumns = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size (Bytes)" },
  { key: "owner", label: "Owner" },
  { key: "perms", label: "Perms" },
  { key: "actions", label: "Actions" },
];

const tableData = computed(() =>
  useMap(ownerFileList.value, (file) => {
    const _file = toValue(file);
    return {
      id: _file.id,
      name: _file.info.name,
      owner: _file.info.owner?.info?.name,
      perm: _file.info.perm,
      size: _file.info.size ? formatPretty(_file.info.size) : undefined,
    };
  })
);

const { pageCount } = useOffsetPagination({
  total: fileQueryCount,
  page,
  pageSize: size,
});
</script>
