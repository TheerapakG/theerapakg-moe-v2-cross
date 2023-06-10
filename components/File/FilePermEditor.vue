<template>
  <div
    class="flex w-full flex-col place-content-center place-items-center gap-y-2"
  >
    <div>changing permission: {{ props.perm }}</div>
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
      <template #actions-data="{ row }">
        <div class="flex h-8 place-content-center place-items-center">
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
type Props = {
  fileId: string;
  perm: string;
};

const props = defineProps<Props>();

type Emits = {
  "user-count": [userCount: number];
};

const emit = defineEmits<Emits>();

const userStore = useUserStore();

const page = ref(1);
const size = ref(5);

const userSearch = ref("");
const userSearchDebounced = refDebounced(userSearch, 300);

const {
  pending,
  data: rawPermsData,
  refresh,
} = await useApiFetch(`/api/file/${props.fileId}/perm/${props.perm}/list`, {
  params: {
    page: page.value,
    size: size.value,
    ...(userSearchDebounced.value && { user: userSearchDebounced.value }),
  },
  watch: [page, size, userSearchDebounced],
});

const permQueryUserCount = computed(
  () => rawPermsData.value?.queryCount ?? Infinity
);

const permTotalUserCount = computed(() => rawPermsData.value?.totalCount);
watch(permTotalUserCount, () => {
  const totalCount = permTotalUserCount.value;
  if (totalCount !== undefined) emit("user-count", totalCount);
});

const permUserList = computed(() => {
  const users = rawPermsData.value?.users;

  if (!users) return [];
  return users.map(({ id, perm }) => {
    return {
      user: {
        id,
        info: userStore.getUser(id),
      },
      perm,
    };
  });
});
const missingUserIDs = computed(() => {
  return useUniq(
    permUserList.value
      .map((permUser) => permUser.user)
      .filter((user) => user.info === undefined)
      .map((user) => user.id)
  );
});
const fetchMissingUser = async () => {
  await Promise.all(
    missingUserIDs.value.map(async (id) => userStore.fetchUser(id))
  );
};

const tableColumns = [{ key: "name", label: "Name" }, { key: "actions" }];

const tableData = computed(() =>
  useMap(permUserList.value, ({ user, perm }) => {
    return {
      id: user.id,
      name: user.info?.name ?? "(loading...)",
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
  await $apiFetch(`/api/file/${props.fileId}/perm/${props.perm}/user/${id}`, {
    method,
  });
  await refresh();
};

onMounted(async () => {
  watch(missingUserIDs, fetchMissingUser);
  await fetchMissingUser();
});
</script>
