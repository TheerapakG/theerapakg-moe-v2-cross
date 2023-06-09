<template>
  <div class="flex flex-col place-content-center place-items-center">
    <ClientOnly>
      <div
        ref="tabBarElement"
        class="thin-scrollbars tab-bar flex w-full place-items-center justify-start gap-x-[0.0625rem] overflow-x-scroll bg-gray-100 px-2 dark:bg-gray-800"
        @wheel="onTabBarScroll"
      >
        <TransitionGroup name="tab-bar">
          <div
            v-for="(view, id) in views"
            :key="id"
            class="relative"
            :class="{
              'tab-active': currentViewId === (id as string),
              'tab-inactive': currentViewId !== (id as string),
            }"
          >
            <button @click="currentViewId = id as string">
              <div
                class="relative flex h-8 flex-row-reverse place-items-center justify-start gap-x-2 rounded-t-lg px-2"
                :class="{
                  'hover:bg-gray-200 hover:transition-colors hover:duration-300 dark:hover:bg-gray-700': currentViewId !== (id as string),
                  'bg-gray-300 dark:bg-gray-600': currentViewId === (id as string),
                }"
              >
                <SVGPathInvertedRoundTL
                  v-if="currentViewId === (id as string)"
                  class="absolute -left-2 bottom-0 h-2 w-2 fill-gray-300 dark:fill-gray-600"
                />
                <SVGPathInvertedRoundTR
                  v-if="currentViewId === (id as string)"
                  class="absolute -right-2 bottom-0 h-2 w-2 fill-gray-300 dark:fill-gray-600"
                />
                <UButton
                  v-if="view.closable"
                  variant="ghost"
                  size="xs"
                  :padded="false"
                  icon="i-heroicons-x-mark"
                  :ui="{ rounded: 'rounded-full' }"
                  @pointerdown.stop=""
                  @click.stop="emit('removeView', id as string)"
                />
                <div class="grow truncate md:w-full md:grow-0">
                  {{ view.name }}
                </div>
              </div>
            </button>
          </div>
        </TransitionGroup>
      </div>
      <div v-for="(view, id) in views" :key="id" class="w-full">
        <div
          v-show="currentViewId === (id as string)"
          class="w-full bg-gray-300 p-2 dark:bg-gray-600"
        >
          <KeepAlive>
            <VNodeTemplate
              v-if="currentViewId === (id as string)"
              :render-node="view.node"
              tag="div"
              class="relative w-full bg-white p-2 dark:bg-black"
            />
          </KeepAlive>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { VNode } from "vue";

interface View {
  name: string;
  node: VNode;
  closable?: boolean;
}

type Props = {
  views: { [id: string]: View };
};

type Emits = {
  removeView: [id: string];
};

const emit = defineEmits<Emits>();

const props = defineProps<Props>();

const { views } = toRefs(props);

const tabBarElement = ref<HTMLDivElement | null>(null);

const onTabBarScroll = (event: WheelEvent) => {
  if (!event.deltaX && event.deltaY)
    tabBarElement.value?.scrollBy({
      left: event.deltaY,
      behavior: "smooth",
    });
};

const currentViewIdRaw = ref(useFirst(useKeys(views.value)) ?? "");

const currentViewId = computed({
  get: () => {
    return currentViewIdRaw.value;
  },
  set: (newCurrentViewId: string) => {
    if (!newCurrentViewId || !views.value[newCurrentViewId]) {
      currentViewIdRaw.value = "";
    } else {
      currentViewIdRaw.value = newCurrentViewId;
    }
  },
});

watch(props.views, () => {
  if (!currentViewId.value || !views.value[currentViewId.value]) {
    currentViewId.value = useFirst(useKeys(views.value)) ?? "";
  }
});
</script>

<style scoped>
.tab-bar-move {
  @apply transition-transform duration-300 ease-in-out;
}

.tab-bar-enter-active,
.tab-bar-leave-active {
  @apply transition duration-300 ease-out;
}

.tab-bar-leave-active {
  @apply w-0;
}

.tab-bar-enter-from,
.tab-bar-leave-to {
  @apply opacity-0;
}
.tab-inactive + .tab-inactive {
  @apply before:absolute before:-left-[0.0625rem] before:top-2 before:h-4 before:w-[0.0625rem] before:bg-gray-400 before:content-[''] before:dark:bg-gray-500;
}
</style>
