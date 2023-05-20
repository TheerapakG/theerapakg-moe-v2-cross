<template>
  <div
    class="mx-auto grid h-8 w-80 grid-cols-[repeat(4,2rem)_3rem_repeat(4,2rem)] place-content-center place-items-center gap-x-0.5"
  >
    <button
      class="button-default h-8 w-8 rounded-full"
      :disabled="page == 1"
      @click="emits('update:modelValue', 1)"
    >
      &lt;&lt;
    </button>
    <div>
      <div v-if="page - 2 > 1">...</div>
    </div>
    <div>
      <button
        v-if="page - 1 > 1"
        class="button-default h-8 w-8 rounded-full"
        @click="emits('update:modelValue', page - 2)"
      >
        {{ page - 2 }}
      </button>
    </div>
    <div>
      <button
        v-if="page > 1"
        class="button-default h-8 w-8 rounded-full"
        @click="emits('update:modelValue', page - 1)"
      >
        {{ page - 1 }}
      </button>
    </div>
    <div>
      <input
        class="input-default w-12 text-center font-bold"
        :value="page"
        @change="
          (event) => emits('update:modelValue', parseInt((event.target as HTMLInputElement).value))
        "
      />
    </div>
    <div>
      <button
        v-if="page < pageCount"
        class="button-default h-8 w-8 rounded-full"
        @click="emits('update:modelValue', page + 1)"
      >
        {{ page + 1 }}
      </button>
    </div>
    <div>
      <button
        v-if="page + 1 < pageCount"
        class="button-default h-8 w-8 rounded-full"
        @click="emits('update:modelValue', page + 2)"
      >
        {{ page + 2 }}
      </button>
    </div>
    <div>
      <div v-if="page + 2 < pageCount">...</div>
    </div>
    <button
      class="button-default h-8 w-8 rounded-full"
      :disabled="page == pageCount"
      @click="emits('update:modelValue', pageCount)"
    >
      &gt;&gt;
    </button>
  </div>
</template>

<script setup lang="ts">
type Props = {
  modelValue: number;
  pageCount: number;
};

const props = defineProps<Props>();

const page = computed(() => props.modelValue);
const pageCount = computed(() => props.pageCount);

type Emits = {
  "update:modelValue": [value: number];
};

const emits = defineEmits<Emits>();
</script>
