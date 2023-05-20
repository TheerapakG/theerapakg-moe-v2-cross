<template>
  <div class="pointer-events-none">
    <Transition name="slide-right">
      <div
        v-if="open"
        class="absolute inset-0 bg-gray-300 dark:bg-gray-600"
      ></div>
    </Transition>
    <button
      class="icon-button pointer-events-auto absolute left-8 top-8"
      :title="open ? 'close sidebar' : 'open sidebar'"
      @click="toggle"
    >
      <Transition
        :name="open ? 'rotate-ccw-out' : 'rotate-cw-out'"
        mode="out-in"
      >
        <Bars3Icon v-if="!open" class="h-8 w-8 transition duration-300" />
        <XMarkIcon v-else class="h-8 w-8 transition duration-300" />
      </Transition>
    </button>
    <Transition name="slide-right">
      <div
        v-if="open"
        class="absolute inset-0 grid grid-cols-1 place-content-center place-items-center"
      >
        <div
          class="pointer-events-auto flex flex-col place-content-center place-items-center"
        >
          <slot name="content" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Ref } from "vue";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";

type Emits = {
  "update:modelValue": [value: boolean];
};

const emit = defineEmits<Emits>();

type Props = {
  modelValue?: boolean | undefined;
};

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
