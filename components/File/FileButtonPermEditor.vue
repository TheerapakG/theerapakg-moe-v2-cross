<template>
  <div class="relative">
    <VDropdown
      :distance="8"
      :boundary="pageContainerDom"
      placement="bottom"
      theme="context-menu"
      @show="open = true"
      @hide="open = false"
    >
      <slot :perm-user-count="permUserCount">
        <button>{{ permUserCount }} users</button>
      </slot>

      <template #popper>
        <LoadingCircleOverlay v-if="pending" />
        <ResponsiveList
          :widths="['12rem', '1.5rem']"
          :body-count="permUserList.length"
          :table-header="false"
        >
          <template #header>
            <div
              class="w-full flex flex-col place-content-center place-items-center gap-y-2"
            >
              <div>changing permission: {{ props.perm }}</div>
              <div
                class="w-full input-default p-2 flex place-content-center place-items-center gap-x-2"
              >
                <SearchIcon class="w-6 h-6" />
                <input v-model="userSearch" class="input-hidden flex-grow" />
              </div>
            </div>
          </template>
          <template #content-col-0="{ index }">
            <div>{{ permUserList[index].user?.name ?? "(loading...)" }}</div>
          </template>
          <template #content-col-1="{ index }">
            <div class="w-6 h-6">
              <button
                v-if="permUserList[index].perm"
                @click="doUser(permUserList[index].user.id, 'DELETE')"
              >
                <MinusIcon class="w-6 h-6" />
              </button>
              <button
                v-else
                @click="doUser(permUserList[index].user.id, 'PUT')"
              >
                <PlusIcon class="w-6 h-6" />
              </button>
            </div>
          </template>
          <template #footer>
            <PaginateNavigation v-model="page" :page-count="pageCount" />
          </template>
        </ResponsiveList>
      </template>
    </VDropdown>
  </div>
</template>

<script setup lang="ts">
import { MinusIcon, PlusIcon, SearchIcon } from "@heroicons/vue/outline";
import { storeToRefs } from "pinia";
import { Ref } from "vue";
import { User, useUserStore } from "~~/store/user";

interface Props {
  fileId: string;
  perm: string;
  userCount: number;
}

const props = defineProps<Props>();

const pageStore = usePageStore();
const userStore = useUserStore();

const { pageContainerDom } = storeToRefs(pageStore);

const open = ref(false);

const page = ref(1);
const size = ref(5);

const userSearch = ref("");
const userSearchDebounced = refDebounced(userSearch, 300);

const {
  pending,
  refresh,
  data: permsData,
}: {
  pending: Ref<boolean>;
  refresh: () => Promise<void>;
  data: Ref<{
    totalCount: number;
    queryCount: number;
    users: { user: User; perm: boolean }[];
  }>;
} = await useAsyncData(
  `file:${props.fileId}:perm:${props.perm}`,
  async () => {
    if (!open.value) {
      return typeof permsData === "undefined"
        ? Promise.resolve(null)
        : Promise.resolve(permsData.value);
    }

    const { totalCount, queryCount, users } = await $apiFetch(
      `/api/file/${props.fileId}/perm/${props.perm}/list`,
      {
        params: {
          page: page.value,
          size: size.value,
          ...(userSearchDebounced.value && { user: userSearchDebounced.value }),
        },
      }
    );

    return {
      totalCount,
      queryCount,
      users: await Promise.all(
        users.map(async ({ id, perm }) => {
          const user = await userStore.useUser(id);
          return {
            user: user as unknown as User,
            perm,
          };
        })
      ),
    };
  },
  {
    watch: [page, size, userSearchDebounced, open],
    initialCache: false,
  }
);

const permQueryUserCount = computed(
  () => permsData.value?.queryCount ?? Infinity
);
const permUserCount = computed(
  () => permsData.value?.totalCount ?? props.userCount
);
const permUserList = computed(() => permsData.value?.users ?? []);

const { pageCount } = useOffsetPagination({
  total: permQueryUserCount,
  page,
  pageSize: size,
});

const doUser = async (id: string, method: string) => {
  await $apiFetch(`/api/file/${props.fileId}/perm/${props.perm}/user/${id}`, {
    method,
  });
  await refresh();
};
</script>
