<template>
  <div>
    <div
      class="w-72 h-8 mx-auto grid grid-cols-[repeat(9,2rem)] place-content-center place-items-center"
    >
      <button class="page-button" :disabled="isFirstPage" @click="page = 1">
        &lt;&lt;
      </button>
      <div>
        <div v-if="page - 2 > 1">...</div>
      </div>
      <div>
        <button v-if="page - 1 > 1" class="page-button" @click="page -= 2">
          {{ page - 2 }}
        </button>
      </div>
      <div>
        <button v-if="page > 1" class="page-button" @click="prev">
          {{ page - 1 }}
        </button>
      </div>
      <div class="font-bold">{{ page }}</div>
      <div>
        <button v-if="page < pageCount" class="page-button" @click="next">
          {{ page + 1 }}
        </button>
      </div>
      <div>
        <button
          v-if="page + 1 < pageCount"
          class="page-button"
          @click="page += 2"
        >
          {{ page + 2 }}
        </button>
      </div>
      <div>
        <div v-if="page + 2 < pageCount">...</div>
      </div>
      <button
        class="page-button"
        :disabled="isLastPage"
        @click="page = pageCount"
      >
        &gt;&gt;
      </button>
    </div>
    <div
      class="grid grid-cols-[32rem_8rem] place-content-center place-items-center"
    >
      <div>file</div>
      <div>size (bytes)</div>
    </div>
    <div
      v-for="file in fileList"
      :key="file.id"
      class="grid grid-cols-[32rem_8rem] place-content-center place-items-center"
    >
      <NuxtLink :to="`/file/download/${file.id}`">{{ file.name }}</NuxtLink>
      <div>{{ file.size }}</div>
    </div>
    <div
      class="w-72 h-8 mx-auto grid grid-cols-[repeat(9,2rem)] place-content-center place-items-center"
    >
      <button class="page-button" :disabled="isFirstPage" @click="page = 1">
        &lt;&lt;
      </button>
      <div>
        <div v-if="page - 2 > 1">...</div>
      </div>
      <div>
        <button v-if="page - 1 > 1" class="page-button" @click="page -= 2">
          {{ page - 2 }}
        </button>
      </div>
      <div>
        <button v-if="page > 1" class="page-button" @click="prev">
          {{ page - 1 }}
        </button>
      </div>
      <div class="font-bold">{{ page }}</div>
      <div>
        <button v-if="page < pageCount" class="page-button" @click="next">
          {{ page + 1 }}
        </button>
      </div>
      <div>
        <button
          v-if="page + 1 < pageCount"
          class="page-button"
          @click="page += 2"
        >
          {{ page + 2 }}
        </button>
      </div>
      <div>
        <div v-if="page + 2 < pageCount">...</div>
      </div>
      <button
        class="page-button"
        :disabled="isLastPage"
        @click="page = pageCount"
      >
        &gt;&gt;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 10;
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

const { pending: generalFileInfoPending, data: generalFileInfo } =
  await useFetch("/api/file/info", {
    headers: useRequestHeaders(["cookie"]),
  });
const { pending: fileListPending, data: fileListData } = await useFetch(
  "/api/file/list",
  {
    headers: useRequestHeaders(["cookie"]),
    params: () => {
      return {
        page: page.value,
        size: size.value,
      };
    },
    watch: [page, size],
  }
);

const pending = computed(
  () => generalFileInfoPending.value && fileListPending.value
);
const fileCount = computed(() => generalFileInfo.value?.value?.count);
const fileList = computed(() => fileListData.value?.value?.files ?? []);

const { pageCount, isFirstPage, isLastPage, prev, next } = useOffsetPagination({
  total: fileCount,
  page,
  pageSize: size,
});
</script>

<style scoped>
.page-button {
  @apply w-8 h-8 rounded-full bg-black dark:bg-white disabled:opacity-20 text-white dark:text-black font-bold;
}
</style>
