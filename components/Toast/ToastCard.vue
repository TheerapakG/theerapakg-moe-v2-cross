<template>
  <div>
    <SwipeableAnimatedComponent
      class="w-full"
      @swipe-success="toastStore.kill(toastId as string)"
    >
      <div class="relative w-full">
        <div
          class="w-full flex flex-col justify-start place-items-center gap-y-2 p-4 rounded-full md:rounded-lg bg-gray-300 dark:bg-gray-600"
        >
          <div
            class="w-full flex flex-row-reverse justify-start place-items-center gap-x-2 truncate"
          >
            <button
              v-if="toast.killable"
              @pointerdown.stop=""
              @click.stop="toastStore.kill(toastId as string)"
            >
              <XIcon
                class="w-6 h-6 md:w-8 md:h-8 stroke-black dark:stroke-white hover:stroke-gray-600 dark:hover:stroke-gray-300"
              />
            </button>
            <div
              class="grow md:grow-0 md:w-full flex justify-start place-items-center gap-x-2 truncate"
            >
              <div v-if="toast.icon">
                <div v-if="typeof toast.icon === 'string'">
                  {{ toast.icon }}
                </div>
                <div v-else>
                  <VNodeTemplate
                    :render-node="toast.icon"
                    class="w-6 h-6 md:w-8 md:h-8 stroke-gray-600 dark:stroke-gray-300"
                  />
                </div>
              </div>
              <div
                class="flex flex-col content-center justify-start place-items-center font-bold md:text-2xl truncate"
              >
                <div
                  v-if="typeof toast.title === 'string'"
                  class="flex-1 w-full whitespace-pre-wrap text-ellipsis overflow-hidden"
                >
                  {{ toast.title }}
                </div>
                <div v-else>
                  <VNodeTemplate :render-node="toast.title" />
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="toast.description"
            class="hidden md:flex flex-col content-center justify-start place-items-center w-full max-h-24 truncate"
          >
            <div
              v-if="typeof toast.description === 'string'"
              class="flex-1 w-full whitespace-pre-wrap text-ellipsis overflow-hidden"
            >
              {{ toast.description }}
            </div>
            <div v-else>
              <VNodeTemplate :render-node="toast.description" />
            </div>
          </div>
          <div
            v-if="toast.actions"
            class="w-full hidden md:flex md:place-content-center md:place-items-center md:gap-x-2"
          >
            <button
              v-for="(action, name) in toast.actions"
              :key="(name as string)"
              class="flex-1 rounded-lg bg-gray-400 dark:bg-gray-500 hover:bg-gray-500 dark:hover:bg-gray-400 transition-colors duration-300"
              @click.stop="action.action"
            >
              {{ action.title }}
            </button>
          </div>
        </div>
        <div
          class="absolute inset-0 rounded-full md:rounded-lg overflow-hidden pointer-events-none"
        >
          <div
            v-if="toast.expire"
            class="absolute left-0 bottom-0 h-full md:h-1 bg-black bg-opacity-25 dark:bg-white dark:bg-opacity-25 transition-all duration-100 linear"
            :style="{
              width: `${
                ((toast.expire - timestamp) / (toast.expire - toast.spawn)) *
                100
              }%`,
            }"
          />
        </div>
      </div>
    </SwipeableAnimatedComponent>
  </div>
</template>

<script setup lang="ts">
import { XIcon } from "@heroicons/vue/outline";

interface Props {
  toastStoreId: string;
  toastId: string;
}

const props = defineProps<Props>();

const { toastStoreId, toastId } = toRefs(props);

const timestamp = useTimestamp();

const toastStore = useToastStore(toastStoreId.value);
const toast = toastStore.toasts[toastId.value];
</script>
