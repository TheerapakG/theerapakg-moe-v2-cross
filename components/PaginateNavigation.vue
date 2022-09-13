<template>
  <div
    class="w-80 h-8 mx-auto grid grid-cols-[repeat(4,2rem)_3rem_repeat(4,2rem)] gap-x-0.5 place-content-center place-items-center"
  >
    <button
      class="page-button"
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
        class="page-button"
        @click="emits('update:modelValue', page - 2)"
      >
        {{ page - 2 }}
      </button>
    </div>
    <div>
      <button
        v-if="page > 1"
        class="page-button"
        @click="emits('update:modelValue', page - 1)"
      >
        {{ page - 1 }}
      </button>
    </div>
    <div>
      <input
        class="w-12 input-default font-bold text-center"
        :value="page"
        @change="
          (event) => emits('update:modelValue', parseInt((event.target as HTMLInputElement).value))
        "
      />
    </div>
    <div>
      <button
        v-if="page < pageCount"
        class="page-button"
        @click="emits('update:modelValue', page + 1)"
      >
        {{ page + 1 }}
      </button>
    </div>
    <div>
      <button
        v-if="page + 1 < pageCount"
        class="page-button"
        @click="emits('update:modelValue', page + 2)"
      >
        {{ page + 2 }}
      </button>
    </div>
    <div>
      <div v-if="page + 2 < pageCount">...</div>
    </div>
    <button
      class="page-button"
      :disabled="page == pageCount"
      @click="emits('update:modelValue', pageCount)"
    >
      &gt;&gt;
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number;
  pageCount: number;
}

const props = defineProps<Props>();

const page = computed(() => props.modelValue);
const pageCount = computed(() => props.pageCount);

interface Emits {
  (event: "update:modelValue", value: number): void;
}

const emits = defineEmits<Emits>();
</script>

<style scoped>
.page-button {
  @apply w-8 h-8 rounded-full bg-black dark:bg-white disabled:opacity-20 text-white dark:text-black font-bold;
}
</style>
