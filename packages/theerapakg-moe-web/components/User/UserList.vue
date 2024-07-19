<script setup lang="ts">
import defu from "defu";

type Props = {
  pending?: boolean;
  selected?: string[];
};

const props = withDefaults(defineProps<Props>(), { selected: undefined });
const { pending: propsPending, selected } = toRefs(props);

type Emits = {
  show: [string[]];
  add: [string];
  remove: [string];
};

const emit = defineEmits<Emits>();

const userStore = useUserStore();

const page = ref(1);
const size = ref(5);

const userSearch = ref("");
const userSearchDebounced = refDebounced(userSearch, 300);

const userParams = computed(() => {
  return defu(
    userSearchDebounced.value ? { user: userSearchDebounced.value } : undefined,
    { page: page.value, size: size.value },
  );
});

const { pending: userListPending, data: rawUserList } = await useApiFetch(
  `/api/user/list`,
  {
    params: userParams,
  },
);

const tablePending = computed(
  () => propsPending.value || userListPending.value,
);
const queryUserCount = computed(() => rawUserList.value?.count ?? Infinity);
const queryUserList = computed(() => rawUserList.value?.users ?? []);
emit("show", queryUserList.value);
watch(queryUserList, () => emit("show", queryUserList.value));

const userList = await userStore.fetchUsersComputed(queryUserList);

const tableColumns = computed(() => [
  { key: "name", label: "Name" },
  ...(selected.value ? [{ key: "actions" }] : []),
]);

const tableData = computed(() =>
  useMap(userList.value, (user) => {
    return toValue(user);
  }),
);

const { pageCount } = useOffsetPagination({
  total: queryUserCount,
  page,
  pageSize: size,
});
</script>

<template>
  <div
    class="flex w-full flex-col place-content-center place-items-center gap-y-2"
  >
    <UInput v-model="userSearch" class="w-full" size="md">
      <template #leading>
        <UIcon
          :name="
            tablePending
              ? 'i-heroicons-arrow-path'
              : 'i-heroicons-magnifying-glass'
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
      <template v-if="selected" #actions-data="{ row }">
        <div class="inline-flex h-8 place-content-center place-items-center">
          <UButton
            v-if="selected.some((value) => value === row.id)"
            variant="ghost"
            size="xl"
            icon="i-heroicons-minus"
            :ui="{ rounded: 'rounded-full' }"
            @click="emit('remove', row.id)"
          />
          <UButton
            v-else
            variant="ghost"
            size="xl"
            icon="i-heroicons-plus"
            :ui="{ rounded: 'rounded-full' }"
            @click="emit('add', row.id)"
          />
        </div>
      </template>
    </UTable>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </div>
</template>
