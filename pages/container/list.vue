<template>
  <div class="relative">
    <Transition name="fade">
      <LoadingCircleOverlay v-if="pending" />
      <UContainer v-else class="thin-scrollbars overflow-x-auto">
        <UTable :columns="tableColumns" :rows="tableData">
          <template #actions-data="{ row }">
            <div
              class="inline-flex h-8 w-min place-content-center place-items-center gap-x-1"
            >
              <UButton
                variant="ghost"
                size="xl"
                icon="i-heroicons-document-text"
                :ui="{ rounded: 'rounded-full' }"
                :to="`/container/${row.id}/logs`"
              />
              <UButton
                variant="ghost"
                size="xl"
                icon="i-heroicons-pause"
                :ui="{ rounded: 'rounded-full' }"
                @click="pauseContainer(row.id)"
              />
              <UButton
                variant="ghost"
                size="xl"
                icon="i-heroicons-play"
                :ui="{ rounded: 'rounded-full' }"
                @click="unpauseContainer(row.id)"
              />
              <UButton
                variant="ghost"
                size="xl"
                icon="i-heroicons-stop"
                :ui="{ rounded: 'rounded-full' }"
                @click="killContainer(row.id)"
              />
              <UButton
                variant="ghost"
                size="xl"
                icon="i-heroicons-minus"
                :ui="{ rounded: 'rounded-full' }"
                @click="removeContainer(row.id)"
              />
            </div>
          </template>
        </UTable>
      </UContainer>
    </Transition>
    <PaginateNavigation v-model="page" :page-count="pageCount" />
  </div>
</template>

<script setup lang="ts">
import type { Notification } from "@nuxthq/ui/dist/runtime/types";

definePageMeta({
  title: "theerapakg-moe-app: container manager",
  name: "Container Manager",
  perms: ["perms:container:list"],
});

const route = useRoute();
const toast = useToast();

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 10;
const size = ref(isNaN(_size) ? 10 : _size);

const params = computed(() => {
  return {
    page: page.value,
    size: size.value,
  };
});
const {
  pending,
  data: containerListData,
  refresh,
} = await useApiFetch("/api/container/list", {
  params,
});

const containerQueryCount = computed(() => containerListData.value?.count ?? 0);
const containerList = computed(() => containerListData.value?.containers ?? []);

const tableColumns = [
  { key: "id", label: "ID" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const tableData = computed(() =>
  useMap(containerList.value, ({ id, state }) => {
    return {
      id: id,
      status: state.status,
    };
  })
);

const { pageCount } = useOffsetPagination({
  total: containerQueryCount,
  page,
  pageSize: size,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args: any) => any;

const wrapToast =
  <T extends Func>(
    func: (...args: Parameters<T>) => ReturnType<T>,
    errorToast: Partial<Notification>,
    successToast: Partial<Notification>
  ): ((...args: Parameters<T>) => Promise<ReturnType<T> | undefined>) =>
  async (...args: Parameters<T>) => {
    let ret;
    try {
      ret = await func(...args);
    } catch {
      toast.add(errorToast);
      return;
    }
    toast.add(successToast);
    return ret;
  };

const pauseContainer = wrapToast(
  async (id: string) => {
    await $apiFetch(`/api/container/${id}/pause`, {
      method: "POST",
    });
    await refresh();
  },
  {
    title: "Error Pausing Container",
    icon: "i-heroicons-exclaimation-circle",
    color: "red",
  },
  {
    title: "Container Paused",
    icon: "i-heroicons-exclaimation-circle",
  }
);

const unpauseContainer = wrapToast(
  async (id: string) => {
    await $apiFetch(`/api/container/${id}/unpause`, {
      method: "POST",
    });
    await refresh();
  },
  {
    title: "Error Unpausing Container",
    icon: "i-heroicons-exclaimation-circle",
    color: "red",
  },
  {
    title: "Container Unpaused",
    icon: "i-heroicons-exclaimation-circle",
  }
);

const killContainer = wrapToast(
  async (id: string) => {
    await $apiFetch(`/api/container/${id}/kill`, {
      method: "POST",
    });
    await refresh();
  },
  {
    title: "Error Killing Container",
    icon: "i-heroicons-exclaimation-circle",
    color: "red",
  },
  {
    title: "Container Killed",
    icon: "i-heroicons-exclaimation-circle",
  }
);

const removeContainer = wrapToast(
  async (id: string) => {
    await $apiFetch(`/api/container/${id}`, {
      method: "DELETE",
    });
    await refresh();
  },
  {
    title: "Error Deleting Container",
    icon: "i-heroicons-exclaimation-circle",
    color: "red",
  },
  {
    title: "Container Deleted",
    icon: "i-heroicons-exclaimation-circle",
  }
);
</script>
