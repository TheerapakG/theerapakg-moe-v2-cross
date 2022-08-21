<template>
  <div class="flex flex-col place-content-center place-items-center">
    <ClientOnly>
      <TransitionGroup
        ref="tabBarElement"
        name="tab-bar"
        tag="div"
        class="w-full px-2 flex justify-start place-items-center gap-x-[0.0625rem] overflow-x-scroll thin-scrollbars bg-gray-100 dark:bg-gray-800 tab-bar"
        @wheel="onTabBarScroll"
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
          <button @click="currentViewId = (id as string)">
            <div
              class="relative px-2 h-8 flex flex-row-reverse justify-start place-items-center gap-x-2 rounded-t-lg"
              :class="{
                  'hover:bg-gray-200 dark:hover:bg-gray-700 hover:transition-colors hover:duration-300': currentViewId !== (id as string),
                  'bg-gray-300 dark:bg-gray-600': currentViewId === (id as string),
                }"
            >
              <SVGPathInvertedRoundTL
                v-if="currentViewId === (id as string)"
                class="absolute -left-2 bottom-0 w-2 h-2 fill-gray-300 dark:fill-gray-600"
              />
              <SVGPathInvertedRoundTR
                v-if="currentViewId === (id as string)"
                class="absolute -right-2 bottom-0 w-2 h-2 fill-gray-300 dark:fill-gray-600"
              />
              <button
                v-if="view.closable"
                @pointerdown.stop=""
                @click.stop="emit('removeView', id as string)"
              >
                <XIcon
                  class="w-4 h-4 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 stroke-black dark:stroke-white"
                />
              </button>
              <div class="grow md:grow-0 md:w-full truncate">
                {{ view.name }}
              </div>
            </div>
          </button>
        </div>
      </TransitionGroup>
      <div v-for="(view, id) in views" :key="id" class="w-full">
        <div
          v-show="currentViewId === (id as string)"
          class="w-full p-2 bg-gray-300 dark:bg-gray-600"
        >
          <KeepAlive>
            <VNodeTemplate
              v-if="currentViewId === (id as string)"
              :render-node="view.node"
              tag="div"
              class="relative w-full p-2 bg-white dark:bg-black"
            />
          </KeepAlive>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { VNode } from "vue";
import { XIcon } from "@heroicons/vue/outline";

interface View {
  name: string;
  node: VNode;
  closable?: boolean;
}

interface Props {
  views: { [id: string]: View };
}

interface Emits {
  (event: "removeView", id: string): void;
}

const emit = defineEmits<Emits>();

const props = defineProps<Props>();

const { views } = toRefs(props);

const tabBarElement = ref<HTMLElement | null>(null);

const onTabBarScroll = (event: WheelEvent) => {
  if (!event.deltaX && event.deltaY)
    tabBarElement.value?.scrollBy({
      left: 10 * Math.sign(event.deltaY),
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
  @apply before:content-[''] before:absolute before:-left-[0.0625rem] before:top-2 before:w-[0.0625rem] before:h-4 before:bg-gray-400 before:dark:bg-gray-500;
}
</style>
