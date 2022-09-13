<template>
  <div>
    <div
      class="grid grid-cols-[16rem_40rem_8rem] place-content-center place-items-center"
    >
      <div>from</div>
      <div>to</div>
      <div>action</div>
    </div>
    <div
      v-for="sh in shList"
      :key="sh.from"
      class="grid grid-cols-[16rem_40rem_8rem] place-content-center place-items-center"
    >
      <div>{{ sh.from }}</div>
      <div>{{ sh.to }}</div>
      <div>
        <button @click="removeSh(sh.from)">
          <MinusIcon class="w-6 h-6" />
        </button>
      </div>
    </div>
    <div
      class="grid grid-cols-[16rem_40rem_8rem] place-content-center place-items-center"
    >
      <div class="w-full">
        <input v-model="newSh" class="w-full input-default text-center" />
      </div>
      <div class="w-full">
        <input v-model="newTarget" class="w-full input-default text-center" />
      </div>
      <button @click="addSh">
        <PlusIcon class="w-6 h-6" />
      </button>
    </div>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, MinusIcon } from "@heroicons/vue/outline";
const route = useRoute();
const router = useRouter();

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 25;
const size = ref(isNaN(_size) ? 10 : _size);

if (process.client) {
  watch([page, size], () => {
    if (!isNaN(page.value) && !isNaN(size.value)) {
      router.replace({
        path: route.path,
        query: { page: page.value, size: size.value },
      });
    }
  });
}

const {
  pending,
  data: shListData,
  refresh: refreshShListData,
} = await useAsyncData(
  async () => {
    const { value } = await $fetch("/api/sh/list", {
      headers: useRequestHeaders(["cookie"]),
      params: {
        page: page.value,
        size: size.value,
      },
    });

    return value;
  },
  {
    watch: [page, size],
  }
);

const shCount = computed(() => shListData.value?.count ?? 0);
const shList = computed(() => shListData.value?.sh ?? []);

const { pageCount } = useOffsetPagination({
  total: shCount,
  page,
  pageSize: size,
});

const newSh = ref("");
const newTarget = ref("");

const addSh = async () => {
  await $fetch(`/api/sh/${newSh.value}`, {
    headers: useRequestHeaders(["cookie"]),
    method: "PUT",
    params: {
      target: encodeURIComponent(newTarget.value),
    },
  });
  await refreshShListData();
};

const removeSh = async (sh: string) => {
  await $fetch(`/api/sh/${sh}`, {
    headers: useRequestHeaders(["cookie"]),
    method: "DELETE",
  });
  await refreshShListData();
};
</script>
