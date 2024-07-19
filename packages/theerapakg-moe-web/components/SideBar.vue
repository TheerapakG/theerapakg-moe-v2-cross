<script setup lang="ts">
import type { Ref } from "vue";

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

const appConfig = useAppConfig();

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

<template>
  <div class="pointer-events-none">
    <TransitionSlide>
      <div
        v-if="open"
        class="pointer-events-auto absolute inset-0 grid grid-cols-1 place-content-center place-items-center bg-white dark:bg-black"
      >
        <div class="flex flex-col place-content-center place-items-center">
          <slot name="content" />
        </div>
      </div>
    </TransitionSlide>
    <div class="pointer-events-auto absolute left-8 top-8 h-8 w-8">
      <TransitionPop mode="out-in">
        <UButton
          v-if="open"
          aria-label="close sidebar"
          variant="ghost"
          :padded="false"
          icon="i-heroicons-x-mark"
          :ui="{
            icon: { size: { [appConfig.ui.button.default.size]: 'h-8 w-8' } },
          }"
          @click="toggle"
        >
        </UButton>
        <UButton
          v-else
          aria-label="open sidebar"
          variant="ghost"
          :padded="false"
          icon="i-heroicons-bars-3"
          :ui="{
            icon: { size: { [appConfig.ui.button.default.size]: 'h-8 w-8' } },
          }"
          @click="toggle"
        >
        </UButton>
      </TransitionPop>
    </div>
  </div>
</template>
