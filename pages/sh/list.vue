<template>
  <div class="relative">
    <Transition name="fade">
      <LoadingCircleOverlay v-if="pending" />
    </Transition>
    <ResponsiveList
      :widths="['16rem', '40rem', '8rem']"
      :body-count="shList.length"
    >
      <template #header>
        <div
          class="input-default flex w-full place-content-center place-items-center gap-x-2 p-2"
        >
          <MagnifyingGlassIcon class="h-6 w-6" />
          <input v-model="shSearch" class="input-hidden flex-grow" />
        </div>
      </template>
      <template #header-col-0><div>from</div></template>
      <template #content-col-0="{ index }">
        <ShFromEditor :from="shList[index].from" @refresh="refresh" />
      </template>
      <template #footer-col-0>
        <div class="w-full">
          <input v-model="newSh" class="input-default w-full text-center" />
        </div>
      </template>
      <template #header-col-1><div>to</div></template>
      <template #content-col-1="{ index }">
        <ShToEditor
          :from="shList[index].from"
          :to="shList[index].to"
          @refresh="refresh"
        />
      </template>
      <template #footer-col-1>
        <div class="w-full">
          <input v-model="newTarget" class="input-default w-full text-center" />
        </div>
      </template>
      <template #header-col-2><div>actions</div></template>
      <template #content-col-2="{ index }">
        <button @click="removeSh(shList[index].from)">
          <MinusIcon class="h-6 w-6" />
        </button>
      </template>
      <template #footer-col-2>
        <button @click="addSh">
          <PlusIcon class="h-6 w-6" />
        </button>
      </template>
      <template #footer>
        <PaginateNavigation v-model="page" :page-count="pageCount" />
      </template>
    </ResponsiveList>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";

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

const shSearch = ref(route.query.q ?? "");
const shSearchDebounced = refDebounced(shSearch, 300);

if (process.client) {
  watch([page, size, shSearchDebounced], async () => {
    if (!isNaN(page.value) && !isNaN(size.value)) {
      await navigateTo({
        path: route.path,
        query: {
          page: page.value,
          size: size.value,
          ...(shSearchDebounced.value && { q: shSearchDebounced.value }),
        },
        replace: true,
      });
    }
  });
}

const {
  pending,
  data: shListData,
  refresh,
} = await useAsyncData(
  async () =>
    await $apiFetch("/api/sh/list", {
      params: {
        page: page.value,
        size: size.value,
        ...(shSearchDebounced.value && { sh: shSearchDebounced.value }),
      },
    }),
  {
    watch: [page, size, shSearchDebounced],
  }
);

const shQueryCount = computed(() => shListData.value?.queryCount ?? 0);
const shList = computed(() => shListData.value?.sh ?? []);

const { pageCount } = useOffsetPagination({
  total: shQueryCount,
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
  await refresh();
};

const removeSh = async (sh: string) => {
  await $apiFetch(`/api/sh/${sh}`, {
    method: "DELETE",
  });
  await refresh();
};
</script>
