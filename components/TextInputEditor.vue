<template>
  <div class="w-full">
    <div v-if="!edit" class="flex place-content-center place-items-center">
      <div class="flex-grow">
        <slot>
          <div>
            {{ props.modelValue }}
          </div>
        </slot>
      </div>
      <button @click="startEdit">
        <PencilIcon class="w-6 h-6" />
      </button>
    </div>
    <div v-else class="flex place-content-center place-items-center">
      <input
        v-model.lazy="inputValue"
        class="input-default flex-grow text-center"
      />
      <button @click="submitEdit">
        <CheckIcon class="w-6 h-6" />
      </button>
      <button @click="stopEdit">
        <XIcon class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon, CheckIcon, XIcon } from "@heroicons/vue/outline";

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
