<template>
  <div class="pointer-events-none">
    <Transition name="slide-right">
      <div
        v-if="open"
        class="pointer-events-auto absolute inset-0 flex flex-col place-content-center place-items-center bg-gray-300 dark:bg-gray-600"
      >
        <slot name="content" />
      </div>
    </Transition>
    <button class="pointer-events-auto absolute top-8 left-8" @click="toggle">
      <Transition
        :name="open ? 'rotate-ccw-out' : 'rotate-cw-out'"
        mode="out-in"
      >
        <Bars3Icon
          v-if="!open"
          class="h-8 w-8 stroke-black hover:stroke-gray-600 dark:stroke-white dark:hover:stroke-gray-300"
        />
        <XMarkIcon
          v-else
          class="h-8 w-8 stroke-black hover:stroke-gray-600 dark:stroke-white dark:hover:stroke-gray-300"
        />
      </Transition>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Ref } from "vue";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";

interface Emits {
  (event: "update:modelValue", value: boolean): void;
}

const emit = defineEmits<Emits>();

interface Props {
  modelValue?: boolean | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
});
const { open, toggle } =
  props.modelValue !== undefined
    ? {
        open: computed(() => props.modelValue),
        toggle: () => {
          emit("update:modelValue", !open.value);
        },
      }
    : {
        open: ref(false),
        toggle: () => {
          (open as Ref<boolean>).value = !open.value;
        },
      };

defineExpose({
  open,
  toggle,
});
</script>
