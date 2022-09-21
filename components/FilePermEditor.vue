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
      <button>{{ permUserCount }} users</button>

      <template #popper>
        <div
          class="flex flex-col place-content-center place-items-center gap-y-4"
        >
          <div>changing permission: {{ props.perm }}</div>
          <div
            v-for="user in permUserList"
            :key="user.user.id"
            class="mx-auto grid grid-cols-[12rem_1.5rem] place-content-center place-items-center gap-x-4"
          >
            <div>{{ user.user?.name ?? "(loading...)" }}</div>
            <div class="w-6 h-6">
              <button v-if="user.perm" @click="doUser(user.user.id, 'DELETE')">
                <MinusIcon class="w-6 h-6" />
              </button>
              <button v-else @click="doUser(user.user.id, 'PUT')">
                <PlusIcon class="w-6 h-6" />
              </button>
            </div>
          </div>
          <PaginateNavigation v-model="page" :page-count="pageCount" />
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, MinusIcon } from "@heroicons/vue/outline";
import { storeToRefs } from "pinia";
import { Ref } from "vue";
import { User, useUserStore } from "~~/store/user";

const config = useRuntimeConfig();

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
const size = ref(10);

const {
  pending,
  refresh,
  data: permsData,
}: {
  pending: Ref<boolean>;
  refresh: () => Promise<void>;
  data: Ref<{
    count: number;
    userCount: number;
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

    const {
      value: { count, userCount, users },
    } = await $fetch(`/api/file/${props.fileId}/perm/${props.perm}`, {
      headers: useRequestHeaders(["cookie"]),
      baseURL: config.public?.apiBaseURL ?? "/",
      params: {
        page: page.value,
        size: size.value,
      },
    });

    return {
      count,
      userCount,
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
    watch: [page, size, open],
    initialCache: false,
  }
);

const allUserCount = computed(() => permsData.value?.userCount ?? Infinity);
const permUserCount = computed(() => permsData.value?.count ?? props.userCount);
const permUserList = computed(() => permsData.value?.users ?? []);

const { pageCount } = useOffsetPagination({
  total: allUserCount,
  page,
  pageSize: size,
});

const doUser = async (id: string, method: string) => {
  await $fetch(`/api/file/${props.fileId}/perm/${props.perm}/user/${id}`, {
    headers: useRequestHeaders(["cookie"]),
    baseURL: config.public?.apiBaseURL ?? "/",
    method,
  });
  await refresh();
};
</script>
