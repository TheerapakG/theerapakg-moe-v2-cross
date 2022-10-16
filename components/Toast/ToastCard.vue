<template>
  <div>
    <SwipeableAnimatedComponent
      class="w-full"
      @swipe-success="toastStore.kill(toastId as string)"
    >
      <div class="relative w-full">
        <div
          class="flex w-full flex-col place-items-center justify-start gap-y-2 rounded-full bg-gray-300 p-4 dark:bg-gray-600 md:rounded-lg"
        >
          <div
            class="flex w-full flex-row-reverse place-items-center justify-start gap-x-2 truncate"
          >
            <button
              v-if="toast.killable"
              @pointerdown.stop=""
              @click.stop="toastStore.kill(toastId as string)"
            >
              <XMarkIcon
                class="h-6 w-6 stroke-black hover:stroke-gray-600 dark:stroke-white dark:hover:stroke-gray-300 md:h-8 md:w-8"
              />
            </button>
            <div
              class="flex grow place-items-center justify-start gap-x-2 truncate md:w-full md:grow-0"
            >
              <div v-if="toast.icon">
                <div v-if="typeof toast.icon === 'string'">
                  {{ toast.icon }}
                </div>
                <div v-else>
                  <VNodeTemplate
                    :render-node="toast.icon"
                    class="h-6 w-6 stroke-gray-600 dark:stroke-gray-300 md:h-8 md:w-8"
                  />
                </div>
              </div>
              <div
                class="flex flex-col place-items-center content-center justify-start truncate font-bold md:text-2xl"
              >
                <div
                  v-if="typeof toast.title === 'string'"
                  class="w-full flex-1 overflow-hidden text-ellipsis whitespace-pre-wrap"
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
            class="hidden max-h-24 w-full flex-col place-items-center content-center justify-start truncate md:flex"
          >
            <div
              v-if="typeof toast.description === 'string'"
              class="w-full flex-1 overflow-hidden text-ellipsis whitespace-pre-wrap"
            >
              {{ toast.description }}
            </div>
            <div v-else>
              <VNodeTemplate :render-node="toast.description" />
            </div>
          </div>
          <div
            v-if="toast.actions"
            class="hidden w-full md:flex md:place-content-center md:place-items-center md:gap-x-2"
          >
            <button
              v-for="(action, name) in toast.actions"
              :key="(name as string)"
              class="flex-1 rounded-lg bg-gray-400 transition-colors duration-300 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-400"
              @click.stop="action.action"
            >
              {{ action.title }}
            </button>
          </div>
        </div>
        <div
          class="pointer-events-none absolute inset-0 overflow-hidden rounded-full md:rounded-lg"
        >
          <div
            v-if="toast.expire"
            class="linear absolute left-0 bottom-0 h-full bg-black bg-opacity-25 transition-all duration-100 dark:bg-white dark:bg-opacity-25 md:h-1"
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
import { XMarkIcon } from "@heroicons/vue/24/outline";

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
