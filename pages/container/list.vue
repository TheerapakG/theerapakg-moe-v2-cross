<template>
  <div class="relative">
    <Transition name="fade">
      <LoadingCircleOverlay v-if="pending" />
    </Transition>
    <ResponsiveList
      :widths="['32rem', '8rem', '16rem']"
      :body-count="containerList.length"
    >
      <template #header-col-0><div>container ID</div></template>
      <template #content-col-0="{ index }">
        {{ containerList[index].id }}
      </template>
      <template #header-col-1><div>status</div></template>
      <template #content-col-1="{ index }">
        {{ containerList[index].state.status }}
      </template>
      <template #header-col-2><div>actions</div></template>
      <template #content-col-2="{ index }">
        <div class="flex place-content-center place-items-center gap-x-1">
          <NuxtLink :to="`/container/${containerList[index].id}/logs`">
            <button
              class="icon-button t-transition-default flex place-content-center place-items-center"
            >
              <DocumentTextIcon class="h-6 w-6" />
            </button>
          </NuxtLink>
          <button
            class="icon-button t-transition-default"
            @click="pauseContainer(containerList[index].id)"
          >
            <PauseIcon class="h-6 w-6" />
          </button>
          <button
            class="icon-button t-transition-default"
            @click="unpauseContainer(containerList[index].id)"
          >
            <PlayIcon class="h-6 w-6" />
          </button>
          <button
            class="icon-button t-transition-default"
            @click="killContainer(containerList[index].id)"
          >
            <StopIcon class="h-6 w-6" />
          </button>
          <button
            class="icon-button t-transition-default"
            @click="removeContainer(containerList[index].id)"
          >
            <MinusIcon class="h-6 w-6" />
          </button>
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
  DocumentTextIcon,
  ExclamationCircleIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/vue/24/outline";
import { ToastOptions } from "~/store/toast";

definePageMeta({
  title: "theerapakg-moe-app: container manager",
  name: "Container Manager",
  perms: ["perms:container:list"],
});

const route = useRoute();
const toastStore = useToastStore("layout");

const _page = route.query.page ? parseInt(route.query.page as string) : 1;
const page = ref(isNaN(_page) ? 1 : _page);
const _size = route.query.size ? parseInt(route.query.size as string) : 15;
const size = ref(isNaN(_size) ? 15 : _size);

const {
  pending,
  data: containerListData,
  refresh,
} = await useApiFetch("/api/container/list", {
  params: {
    page: page.value,
    size: size.value,
  },
  watch: [page, size],
});

const containerQueryCount = computed(() => containerListData.value?.count ?? 0);
const containerList = computed(() => containerListData.value?.containers ?? []);

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
    errorToast: ToastOptions,
    successToast: ToastOptions
  ): ((...args: Parameters<T>) => Promise<ReturnType<T> | undefined>) =>
  async (...args: Parameters<T>) => {
    let ret;
    try {
      ret = await func(...args);
    } catch {
      toastStore.spawn(errorToast);
      return;
    }
    toastStore.spawn(successToast);
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
    icon: <ExclamationCircleIcon />,
  },
  {
    title: "Container Paused",
    icon: <ExclamationCircleIcon />,
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
    icon: <ExclamationCircleIcon />,
  },
  {
    title: "Container Unpaused",
    icon: <ExclamationCircleIcon />,
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
    icon: <ExclamationCircleIcon />,
  },
  {
    title: "Container Killed",
    icon: <ExclamationCircleIcon />,
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
    icon: <ExclamationCircleIcon />,
  },
  {
    title: "Container Deleted",
    icon: <ExclamationCircleIcon />,
  }
);
</script>
