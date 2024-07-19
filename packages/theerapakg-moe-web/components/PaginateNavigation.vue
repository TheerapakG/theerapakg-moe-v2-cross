<script setup lang="ts">
type Props = {
  modelValue: number;
  pageCount: number;
};

const props = defineProps<Props>();
const { modelValue: page } = toRefs(props);

type Emits = {
  "update:modelValue": [value: number];
};

const emits = defineEmits<Emits>();

const onChange = (event: { target: HTMLInputElement }) =>
  emits("update:modelValue", parseInt(event.target.value));
</script>

<template>
  <div
    class="mx-auto grid h-8 w-80 grid-cols-[repeat(4,2rem)_3rem_repeat(4,2rem)] place-content-center place-items-center gap-x-0.5"
  >
    <UButton
      block
      :disabled="page == 1"
      :ui="{ rounded: 'rounded-full', font: 'font-bold' }"
      label="&lt;&lt;"
      @click="emits('update:modelValue', 1)"
    />
    <div>
      <div v-if="page - 2 > 1">...</div>
    </div>
    <div>
      <UButton
        v-if="page > 2"
        block
        :ui="{ rounded: 'rounded-full', font: 'font-bold' }"
        :label="`${page - 2}`"
        @click="emits('update:modelValue', page - 2)"
      />
    </div>
    <div>
      <UButton
        v-if="page > 1"
        block
        :ui="{ rounded: 'rounded-full', font: 'font-bold' }"
        :label="`${page - 1}`"
        @click="emits('update:modelValue', page - 1)"
      />
    </div>
    <UInput
      class="w-12 text-center font-bold"
      :model-value="page"
      @change="onChange"
    />
    <div>
      <UButton
        v-if="page < pageCount"
        block
        :ui="{ rounded: 'rounded-full', font: 'font-bold' }"
        :label="`${page + 1}`"
        @click="emits('update:modelValue', page + 1)"
      />
    </div>
    <div>
      <UButton
        v-if="page < pageCount - 1"
        block
        :ui="{ rounded: 'rounded-full', font: 'font-bold' }"
        :label="`${page + 2}`"
        @click="emits('update:modelValue', page + 2)"
      />
    </div>
    <div>
      <div v-if="page + 2 < pageCount">...</div>
    </div>
    <UButton
      block
      :disabled="page == pageCount"
      :ui="{ rounded: 'rounded-full', font: 'font-bold' }"
      label="&gt;&gt;"
      @click="emits('update:modelValue', pageCount)"
    />
  </div>
</template>
