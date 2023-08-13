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

watch(views, () => {
  if (!currentViewId.value || !views.value[currentViewId.value]) {
    currentViewId.value = useFirst(useKeys(views.value)) ?? "";
  }
});
</script>

<template>
  <div class="flex flex-col place-content-center place-items-center">
    <ClientOnly>
      <div
        ref="tabBarElement"
        class="thin-scrollbars tab-bar flex w-full place-items-center justify-start gap-x-[1px] overflow-x-scroll bg-gray-100 px-2 dark:bg-gray-800 [&_.tab-inactive+.tab-inactive]:before:absolute [&_.tab-inactive+.tab-inactive]:before:-left-[1px] [&_.tab-inactive+.tab-inactive]:before:top-2 [&_.tab-inactive+.tab-inactive]:before:h-4 [&_.tab-inactive+.tab-inactive]:before:w-[1px] [&_.tab-inactive+.tab-inactive]:before:bg-gray-400 [&_.tab-inactive+.tab-inactive]:before:content-[''] [&_.tab-inactive+.tab-inactive]:before:dark:bg-gray-500"
        @wheel="onTabBarScroll"
      >
        <TransitionGroup
          name="tab-bar"
          move-class="transition-transform duration-300 ease-in-out"
          enter-active-class="transition duration-300 ease-out"
          leave-active-class="w-0 transition duration-300 ease-out"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
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
                  'hover:bg-gray-200 hover:transition-colors hover:duration-300 dark:hover:bg-gray-700':
                    currentViewId !== (id as string),
                  'bg-gray-300 dark:bg-gray-600':
                    currentViewId === (id as string),
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
      <div class="w-full bg-gray-300 p-2 dark:bg-gray-600">
        <div
          v-for="(view, id) in views"
          v-show="currentViewId === (id as string)"
          :key="id"
          class="relative w-full bg-white p-2 dark:bg-black"
        >
          <KeepAlive>
            <VNodeTemplate
              v-if="currentViewId === (id as string)"
              :node="view.node"
            />
          </KeepAlive>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
