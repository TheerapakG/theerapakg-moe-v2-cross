<template>
  <div class="pointer-events-none">
    <Transition name="slide-right">
      <div
        v-if="open"
        class="absolute inset-0 flex flex-col place-content-center place-items-center bg-gray-300 dark:bg-gray-600 pointer-events-auto"
      >
        <slot name="content" />
      </div>
    </Transition>
    <button class="absolute top-8 left-8 pointer-events-auto" @click="toggle">
      <Transition
        :name="open ? 'rotate-ccw-out' : 'rotate-cw-out'"
        mode="out-in"
      >
        <MenuIcon
          v-if="!open"
          class="h-8 w-8 stroke-black dark:stroke-white hover:stroke-gray-600 dark:hover:stroke-gray-300"
        />
        <XIcon
          v-else
          class="h-8 w-8 stroke-black dark:stroke-white hover:stroke-gray-600 dark:hover:stroke-gray-300"
        />
      </Transition>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Ref } from "vue";
import { MenuIcon, XIcon } from "@heroicons/vue/outline";

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
