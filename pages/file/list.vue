<script setup lang="ts">
import defu from "defu";
import type { LocationQueryValue } from "vue-router";
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

const _users = route.query.users
  ? (route.query.users as string)
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
  : [];
const users = ref(_users);
const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 10;
const size = ref(isNaN(_size) ? 10 : _size);

const addUser = (id: string) => {
  users.value.push(id);
};

const removeUser = (id: string) => {
  users.value = users.value.filter((e) => e !== id);
};

const fileSearch = ref((route.query.q as LocationQueryValue) ?? "");
const fileSearchDebounced = refDebounced(fileSearch, 300);

const params = computed(() => {
  return defu(
    { page: page.value, size: size.value },
    fileSearchDebounced.value ? { file: fileSearchDebounced.value } : {},
    !isEmpty(users.value) ? { users: users.value.join(",") } : {},
  );
});

watch(params, async () => {
  if (!isNaN(params.value.page) && !isNaN(params.value.size)) {
    await navigateTo({
      path: route.path,
      query: defu(
        {
          page: params.value.page,
          size: params.value.size,
        },
        params.value.file ? { q: params.value.file } : {},
        params.value.users ? { users: params.value.users } : {},
      ),
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
const permUserCountInfos =
  await filePermStore.fetchFilePermCountsComputed(fileList);

const owners = computed(() => fileInfos.value.map((file) => file.value.owner));
const ownerInfos = await userStore.fetchUsersComputed(owners);

const ownerFileList = computed(() =>
  [permUserCountInfos.value.length, ownerInfos.value.length].every(
    (len) => len === fileInfos.value.length,
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
          }),
      )
    : [],
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
  }),
);

const { pageCount } = useOffsetPagination({
  total: fileQueryCount,
  page,
  pageSize: size,
});
</script>

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
      <template #owner-header>
        <div class="inline-flex w-28 place-content-center place-items-center">
          <div class="flex-1"></div>
          <span class="justify-self-center">Owner</span>
          <div class="flex-1">
            <UserButtonList
              class="ml-auto"
              :selected="users"
              @add="addUser"
              @remove="removeUser"
            />
          </div>
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
        <FileButtonAction
          class="h-8 w-8 inline-flex place-content-center place-items-center"
          :file-id="row.id"
          @delete="refresh"
        />
      </template>
    </UTable>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </UContainer>
</template>
