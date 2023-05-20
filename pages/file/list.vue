<template>
  <div class="relative">
    <Transition name="fade">
      <LoadingCircleOverlay v-if="pending" />
    </Transition>
    <ResponsiveList
      :widths="['32rem', '8rem', '8rem', '8rem', '12rem']"
      :body-count="fileList.length"
    >
      <template #header>
        <div
          class="input-default flex w-full place-content-center place-items-center gap-x-2 p-2"
        >
          <MagnifyingGlassIcon class="h-6 w-6" />
          <input v-model="fileSearch" class="input-hidden flex-grow" />
        </div>
      </template>
      <template #header-col-0><div>file</div></template>
      <template #content-col-0="{ index }">
        <FileNameEditor
          class="w-full"
          :file-id="fileList[index].id"
          :name="fileList[index].name"
          @refresh="refresh"
        />
      </template>
      <template #header-col-1><div>size (bytes)</div></template>
      <template #content-col-1="{ index }">
        <div>{{ formatPretty(fileList[index].size) }}</div>
      </template>
      <template #header-col-2><div>owner</div></template>
      <template #content-col-2="{ index }">
        <div>
          {{ fileList[index].owner?.name ?? "(loading...)" }}
        </div>
      </template>
      <template #header-col-3><div>perms</div></template>
      <template #content-col-3="{ index }">
        <div class="flex place-content-center place-items-center gap-2">
          <FileButtonPermEditorGroup
            v-slot="{ perm, permUserCount }"
            :file-id="fileList[index].id"
            :user-count="fileList[index].perms.count"
          >
            <button
              class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
            >
              {{ permUserCount }}
              <VNodeTemplate :render-node="perms[perm]" />
            </button>
          </FileButtonPermEditorGroup>
        </div>
      </template>
      <template #header-col-4><div>actions</div></template>
      <template #content-col-4="{ index }">
        <div
          class="grid grid-cols-5 place-content-center place-items-center gap-2"
        >
          <FileButtonView
            :file-id="fileList[index].id"
            :mime="fileList[index].mime"
            class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
          >
            <button
              :title="`view ${fileList[index].name}`"
              class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
            >
              <EyeIcon class="h-6 w-6" />
            </button>
          </FileButtonView>
          <FileButtonEdit
            :file-id="fileList[index].id"
            :mime="fileList[index].mime"
            @refresh="refresh"
          >
            <button
              :title="`edit ${fileList[index].name}`"
              class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
            >
              <PencilIcon class="h-6 w-6" />
            </button>
          </FileButtonEdit>
          <FileButtonUpload :file-id="fileList[index].id" @refresh="refresh">
            <button
              :title="`upload ${fileList[index].name}`"
              class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
            >
              <CloudArrowUpIcon class="h-6 w-6" />
            </button>
          </FileButtonUpload>
          <NuxtLink :to="`/file/download/${fileList[index].id}`">
            <button
              :title="`download ${fileList[index].name}`"
              class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
            >
              <ArrowDownTrayIcon class="h-6 w-6" />
            </button>
          </NuxtLink>
          <FileButtonDelete :file-id="fileList[index].id" @refresh="refresh">
            <button
              :title="`delete ${fileList[index].name}`"
              class="icon-button t-transition-default flex place-content-center place-items-center gap-1"
            >
              <MinusIcon class="h-6 w-6" />
            </button>
          </FileButtonDelete>
        </div>
      </template>
      <template #footer>
        <PaginateNavigation v-model="page" :page-count="pageCount" />
      </template>
    </ResponsiveList>
  </div>
</template>

<script setup lang="tsx">
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PencilIcon,
} from "@heroicons/vue/24/outline";
import { User } from "~/store/user";
import { formatPretty } from "~/utils/formatPretty";

definePageMeta({
  title: "theerapakg-moe-app: files",
  name: "Files",
  perms: ["perms:file:list"],
});

const route = useRoute();

const userStore = useUserStore();

const perms = {
  view: <EyeIcon class="h-6 w-6" />,
  edit: <PencilIcon class="h-6 w-6" />,
};

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 15;
const size = ref(isNaN(_size) ? 15 : _size);

const fileSearch = ref(route.query.q ?? "");
const fileSearchDebounced = refDebounced(fileSearch, 300);

if (process.client) {
  watch([page, size], async () => {
    if (!isNaN(page.value) && !isNaN(size.value)) {
      await navigateTo({
        path: route.path,
        query: {
          page: page.value,
          size: size.value,
          ...(fileSearchDebounced.value && { q: fileSearchDebounced.value }),
        },
        replace: true,
      });
    }
  });
}

const {
  pending,
  refresh,
  data: fileListData,
} = await useAsyncData(
  async () => {
    const { queryCount, files } = await $apiFetch("/api/file/list", {
      params: {
        page: page.value,
        size: size.value,
        ...(fileSearchDebounced.value && { file: fileSearchDebounced.value }),
      },
    });

    return {
      queryCount,
      files: await Promise.all(
        files.map(async ({ id, name, owner, perms, size, mime }) => {
          const ownerUser = await userStore.useUser(owner);
          return {
            id,
            name,
            owner: ownerUser as unknown as User,
            perms,
            size,
            mime,
          };
        })
      ),
    };
  },
  {
    watch: [page, size, fileSearchDebounced],
  }
);

const fileQueryCount = computed(() => fileListData.value?.queryCount ?? 0);
const fileList = computed(() => fileListData.value?.files ?? []);

const { pageCount } = useOffsetPagination({
  total: fileQueryCount,
  page,
  pageSize: size,
});
</script>
