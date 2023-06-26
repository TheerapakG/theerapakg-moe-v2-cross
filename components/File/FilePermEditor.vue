<template>
  <div
    class="flex w-full flex-col place-content-center place-items-center gap-y-2"
  >
    <div>changing permission: {{ perm }}</div>
    <UInput v-model="userSearch" class="w-full" size="md">
      <template #leading>
        <UIcon
          :name="
            pending ? 'i-heroicons-arrow-path' : 'i-heroicons-magnifying-glass'
          "
          :class="{ 'animate-spin': pending }"
        />
      </template>
    </UInput>
    <UTable class="w-full" :columns="tableColumns" :rows="tableData">
      <template #name-data="{ row }">
        <div
          class="inline-flex h-8 w-28 place-content-center place-items-center"
        >
          <USkeleton v-if="!row.name" class="h-4 w-full" />
          <div v-else>{{ row.name }}</div>
        </div>
      </template>
      <template #actions-data="{ row }">
        <div class="inline-flex h-8 place-content-center place-items-center">
          <UButton
            v-if="row.perm"
            variant="ghost"
            size="xl"
            icon="i-heroicons-minus"
            :ui="{ rounded: 'rounded-full' }"
            @click="doUser(row.id, 'DELETE')"
          />
          <UButton
            v-else
            variant="ghost"
            size="xl"
            icon="i-heroicons-plus"
            :ui="{ rounded: 'rounded-full' }"
            @click="doUser(row.id, 'PUT')"
          />
        </div>
      </template>
    </UTable>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </div>
</template>

<script setup lang="ts">
import defu from "defu";

type Props = {
  fileId: string;
  perm: "view" | "edit";
};

const props = defineProps<Props>();
const { fileId, perm } = toRefs(props);

const userStore = useUserStore();
const filePermStore = useFilePermStore();

const page = ref(1);
const size = ref(5);

const userSearch = ref("");
const userSearchDebounced = refDebounced(userSearch, 300);

const params = computed(() => {
  return defu(
    userSearchDebounced.value ? { user: userSearchDebounced.value } : undefined,
    { page: page.value, size: size.value }
  );
});

const {
  pending,
  data: rawPermList,
  refresh,
} = await useApiFetch(`/api/file/${props.fileId}/perm/${props.perm}/list`, {
  params,
});

const permQueryUserCount = computed(() => rawPermList.value?.count ?? Infinity);
const permList = computed(() => rawPermList.value?.users ?? []);

const users = computed(() => permList.value.map((perm) => perm.id));
const userInfos = await userStore.fetchUsersComputed(users);

const permUserList = computed(() =>
  permList.value.length == userInfos.value.length
    ? useZipWith(permList.value, userInfos.value, (rawPermUser, userInfo) =>
        computed(() => {
          const { id, perm } = toValue(rawPermUser);
          return {
            user: {
              id,
              info: userInfo?.value,
            },
            perm,
          };
        })
      )
    : []
);

const tableColumns = [{ key: "name", label: "Name" }, { key: "actions" }];

const tableData = computed(() =>
  useMap(permUserList.value, (permUser) => {
    const { user, perm } = toValue(permUser);
    return {
      id: user.id,
      name: user.info?.name,
      perm,
    };
  })
);

const { pageCount } = useOffsetPagination({
  total: permQueryUserCount,
  page,
  pageSize: size,
});

const doUser = async (id: string, method: "PUT" | "DELETE") => {
  await $apiFetch(`/api/file/${fileId.value}/perm/${perm.value}/user/${id}`, {
    method,
  });
  await Promise.all([
    refresh(),
    filePermStore.fetchFilePermCount(fileId.value, perm.value, true),
  ]);
};
</script>
