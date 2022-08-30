<template>
  <div class="relative">
    <button @click="open = !open">{{ permUserCount }} users</button>
    <div
      v-if="open"
      class="fixed inset-0 opacity-0"
      @click="open = false"
    ></div>
    <div
      v-if="open"
      class="absolute z-10 left-1/2 -translate-x-1/2 w-60 rounded-lg p-2 bg-gray-300 dark:bg-gray-600"
    >
      <div>changing permission: {{ props.perm }}</div>
      <div
        v-for="user in permUserList"
        :key="user.id"
        class="mx-auto grid grid-cols-[8rem_2rem] place-content-center place-items-center"
      >
        <div>{{ user.name }}</div>
        <div>
          <button v-if="user.perm" @click="doUser(user.id, 'DELETE')">
            <MinusIcon class="w-8 h-8" />
          </button>
          <button v-else @click="doUser(user.id, 'PUT')">
            <PlusIcon class="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, MinusIcon } from "@heroicons/vue/outline";
import { Ref } from "vue";

interface Props {
  fileId: string;
  perm: string;
  userCount: number;
}

const props = defineProps<Props>();

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
    users: { id: string; name: string; perm: boolean }[];
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
          const {
            value: { name },
          } = await $fetch(`/api/user/${id}/info`);
          return {
            id,
            name,
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

const { pageCount, isFirstPage, isLastPage, prev, next } = useOffsetPagination({
  total: allUserCount,
  page,
  pageSize: size,
});

const doUser = async (id: string, method: string) => {
  await $fetch(`/api/file/${props.fileId}/perm/${props.perm}/user/${id}`, {
    method,
  });
  await refresh();
};
</script>
