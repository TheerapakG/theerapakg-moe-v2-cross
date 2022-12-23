<template>
  <div>
    <div
      v-if="!edit"
      class="flex place-content-center place-items-center gap-x-2"
    >
      <div class="min-w-0 flex-1">
        <slot>
          <div class="overflow-hidden text-ellipsis whitespace-nowrap">
            {{ props.modelValue }}
          </div>
        </slot>
      </div>
      <button
        class="icon-button t-transition-default flex-initial"
        @click="startEdit"
      >
        <PencilIcon class="h-6 w-6" />
      </button>
    </div>
    <div v-else class="flex place-content-center place-items-center gap-x-2">
      <input
        v-model.lazy="inputValue"
        class="input-default flex-1 text-center"
      />
      <button
        class="icon-button t-transition-default flex-initial"
        @click="submitEdit"
      >
        <CheckIcon class="h-6 w-6" />
      </button>
      <button
        class="icon-button t-transition-default flex-initial"
        @click="stopEdit"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";

interface Props {
  modelValue: string;
}

const props = defineProps<Props>();

interface Emits {
  (event: "update:modelValue", value: string): void;
}

const emit = defineEmits<Emits>();

const edit = ref(false);
const inputValue = ref("");

const startEdit = () => {
  inputValue.value = props.modelValue;
  edit.value = true;
};

const stopEdit = () => {
  edit.value = false;
};

const submitEdit = () => {
  stopEdit();
  emit("update:modelValue", inputValue.value);
};
</script>
