<template>
  <div class="relative">
    <Transition name="fade">
      <LoadingCircleOverlay v-if="pending" />
    </Transition>
    <ResponsiveList
      :widths="['32rem', '8rem', '8rem', '8rem', '8rem']"
      :body-count="fileList.length"
    >
      <template #header-col-0><div>file</div></template>
      <template #content-col-0="{ index }">
        <FileNameEditor
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
          <FileButtonPermEditor
            v-for="[perm, permIcon] in Object.entries(perms)"
            :key="perm"
            v-slot="{ permUserCount }"
            :file-id="fileList[index].id"
            :perm="perm"
            :user-count="fileList[index].perms[perm] ?? 0"
          >
            <div class="flex place-content-center place-items-center gap-1">
              {{ permUserCount }} <VNodeTemplate :render-node="permIcon" />
            </div>
          </FileButtonPermEditor>
        </div>
      </template>
      <template #header-col-4><div>actions</div></template>
      <template #content-col-4="{ index }">
        <div
          class="grid grid-cols-2 place-content-center place-items-center gap-2"
        >
          <FileButtonEdit :file-id="fileList[index].id" @refresh="refresh">
            <PencilIcon class="w-6 h-6" />
          </FileButtonEdit>
          <FileButtonDelete :file-id="fileList[index].id" @refresh="refresh">
            <MinusIcon class="w-6 h-6" />
          </FileButtonDelete>
        </div>
      </template>
      <template #footer>
        <PaginateNavigation v-model="page" :page-count="pageCount" />
      </template>
    </ResponsiveList>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, MinusIcon, PencilIcon } from "@heroicons/vue/outline";
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
  view: h(EyeIcon, { class: "w-6 h-6" }),
  edit: h(PencilIcon, { class: "w-6 h-6" }),
};

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
  refresh,
  data: fileListData,
} = await useAsyncData(
  async () => {
    const { count, files } = await $apiFetch("/api/file/list", {
      params: {
        page: page.value,
        size: size.value,
      },
    });

    return {
      count,
      files: await Promise.all(
        files.map(async ({ id, name, owner, perms, size }) => {
          const ownerUser = await userStore.useUser(owner);
          return {
            id,
            name,
            owner: ownerUser as unknown as User,
            perms,
            size,
          };
        })
      ),
    };
  },
  {
    watch: [page, size],
  }
);

const fileCount = computed(() => fileListData.value?.count ?? 0);
const fileList = computed(() => fileListData.value?.files ?? []);

const { pageCount } = useOffsetPagination({
  total: fileCount,
  page,
  pageSize: size,
});
</script>
