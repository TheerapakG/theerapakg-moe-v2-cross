<template>
  <div class="relative">
    <Transition name="fade">
      <LoadingCircleOverlay v-if="pending" />
    </Transition>
    <ResponsiveList
      :widths="['16rem', '40rem', '8rem']"
      :body-count="shList.length"
    >
      <template #header-col-0><div>from</div></template>
      <template #content-col-0="{ index }">
        <div>{{ shList[index].from }}</div>
      </template>
      <template #footer-col-0>
        <div class="w-full">
          <input v-model="newSh" class="w-full input-default text-center" />
        </div>
      </template>
      <template #header-col-1><div>to</div></template>
      <template #content-col-1="{ index }">
        <div>{{ shList[index].to }}</div>
      </template>
      <template #footer-col-1>
        <div class="w-full">
          <input v-model="newTarget" class="w-full input-default text-center" />
        </div>
      </template>
      <template #header-col-2><div>actions</div></template>
      <template #content-col-2="{ index }">
        <button @click="removeSh(shList[index].from)">
          <MinusIcon class="w-6 h-6" />
        </button>
      </template>
      <template #footer-col-2>
        <button @click="addSh">
          <PlusIcon class="w-6 h-6" />
        </button>
      </template>
      <template #footer>
        <PaginateNavigation v-model="page" :page-count="pageCount" />
      </template>
    </ResponsiveList>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, MinusIcon } from "@heroicons/vue/outline";

definePageMeta({
  title: "theerapakg-moe-app: shortener manager",
  name: "Shortener Manager",
  perms: ["perms:sh:list"],
});

const route = useRoute();

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 15;
const size = ref(isNaN(_size) ? 15 : _size);

if (process.client) {
  watch([page, size], async () => {
    if (!isNaN(page.value) && !isNaN(size.value)) {
      await navigateTo({
        path: route.path,
        query: { page: page.value, size: size.value },
        replace: true,
      });
    }
  });
}

const {
  pending,
  data: shListData,
  refresh: refreshShListData,
} = await useApiFetch("/api/sh/list", {
  params: {
    page: page.value,
    size: size.value,
  },
  watch: [page, size],
});

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
  await $apiFetch(`/api/sh/${newSh.value}`, {
    method: "PUT",
    params: {
      target: encodeURIComponent(newTarget.value),
    },
  });
  await refreshShListData();
};

const removeSh = async (sh: string) => {
  await $apiFetch(`/api/sh/${sh}`, {
    method: "DELETE",
  });
  await refreshShListData();
};
</script>
