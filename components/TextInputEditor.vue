<script setup lang="ts">
type Props = {
  modelValue: string;
};

const props = defineProps<Props>();
const { modelValue: text } = toRefs(props);

type Emits = {
  "update:modelValue": [value: string];
};

const emit = defineEmits<Emits>();

const edit = ref(false);
const inputValue = ref("");

const startEdit = () => {
  inputValue.value = text.value;
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

<template>
  <div class="h-8">
    <div
      v-if="!edit"
      class="flex h-full place-content-center place-items-center gap-x-2"
    >
      <div class="min-w-0 flex-1">
        <slot>
          <div class="overflow-hidden text-ellipsis whitespace-nowrap">
            {{ text }}
          </div>
        </slot>
      </div>
      <div class="flex-initial">
        <UButton
          variant="ghost"
          size="xl"
          icon="i-heroicons-pencil"
          :ui="{ rounded: 'rounded-full' }"
          @click="startEdit"
        />
      </div>
    </div>
    <div
      v-else
      class="flex h-full place-content-center place-items-center gap-x-2"
    >
      <UInput v-model="inputValue" class="flex-1 text-center" />
      <div class="flex-initial">
        <UButton
          variant="ghost"
          size="xl"
          icon="i-heroicons-check"
          :ui="{ rounded: 'rounded-full' }"
          @click="submitEdit"
        />
      </div>
      <div class="flex-initial">
        <UButton
          variant="ghost"
          size="xl"
          icon="i-heroicons-x-mark"
          :ui="{ rounded: 'rounded-full' }"
          @click="stopEdit"
        />
      </div>
    </div>
  </div>
</template>
