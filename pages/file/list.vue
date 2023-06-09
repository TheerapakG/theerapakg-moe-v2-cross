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
          <FileNameEditor
            class="w-full"
            :file-id="row.id"
            :name="row.name"
            @refresh="refresh"
          />
        </div>
      </template>
      <template #perms-data="{ row }">
        <FileButtonPermEditorGroup
          v-slot="{ perm, permUserCount }"
          class="h-8"
          :file-id="row.id"
          :user-count="row.perms.count"
        >
          <UButton
            variant="ghost"
            size="xl"
            :trailing-icon="perms[perm]"
            :label="`${permUserCount}`"
            :ui="{ rounded: 'rounded-full' }"
          />
        </FileButtonPermEditorGroup>
      </template>
      <template #actions-data="{ row }">
        <div
          class="inline-flex h-8 w-min place-content-center place-items-center gap-x-1"
        >
          <FileButtonView
            :file-id="row.id"
            :mime="row.mime"
            :aria-label="`view ${row.name}`"
          />
          <FileButtonEdit
            :file-id="row.id"
            :mime="row.mime"
            :aria-label="`edit ${row.name}`"
          />
          <FileButtonUpload
            :file-id="row.id"
            :aria-label="`upload ${row.name}`"
            @refresh="refresh"
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
            @refresh="refresh"
          />
        </div>
      </template>
    </UTable>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </UContainer>
</template>

<script setup lang="ts">
import { LocationQueryValue } from "vue-router";
import { User } from "~/store/user";
import { formatPretty } from "~/utils/formatPretty";

definePageMeta({
  title: "theerapakg-moe-app: files",
  name: "Files",
  perms: ["perms:file:list"],
});

const route = useRoute();

const userStore = useUserStore();

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

watch([page, size, fileSearchDebounced], async () => {
  if (!isNaN(page.value) && !isNaN(size.value)) {
    await navigateTo({
      path: route.path,
      query: {
        page: page.value,
        size: size.value,
        ...(fileSearchDebounced.value && { q: fileSearchDebounced.value }),
      },
      replace: true,
    });
  }
});

const {
  pending,
  refresh,
  data: fileListData,
} = await useAsyncData(
  async () => {
    const { queryCount, files } = await $apiFetch("/api/file/list", {
      params: {
        page: page.value,
        size: size.value,
        ...(fileSearchDebounced.value && { file: fileSearchDebounced.value }),
      },
    });

    return {
      queryCount,
      files: await Promise.all(
        files.map(async ({ id, name, owner, perms, size, mime }) => {
          const ownerUser = await userStore.useUser(owner);
          return {
            id,
            name,
            owner: ownerUser as unknown as User,
            perms,
            size,
            mime,
          };
        })
      ),
    };
  },
  {
    watch: [page, size, fileSearchDebounced],
  }
);

const fileQueryCount = computed(() => fileListData.value?.queryCount ?? 0);
const fileList = computed(() => fileListData.value?.files ?? []);

const tableColumns = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size (Bytes)" },
  { key: "owner", label: "Owner" },
  { key: "perms", label: "Perms" },
  { key: "actions", label: "Actions" },
];

const tableData = computed(() =>
  useMap(fileList.value, ({ id, name, owner, perms, size, mime }) => {
    return {
      id,
      name,
      owner: owner.name ?? "(loading ...)",
      perms,
      size: formatPretty(size),
      mime,
    };
  })
);

const { pageCount } = useOffsetPagination({
  total: fileQueryCount,
  page,
  pageSize: size,
});
</script>
