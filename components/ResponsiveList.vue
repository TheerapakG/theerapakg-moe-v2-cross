<template>
  <div ref="containerElement">
    <div
      class="max-w-max mx-auto px-4 rounded-lg flex flex-col place-content-center place-items-center bg-gray-300 dark:bg-gray-600"
      :class="{ small, 'divide-y': !small }"
    >
      <div v-if="'header' in $slots" class="w-full py-2">
        <slot name="header"></slot>
      </div>
      <div ref="headerElement" class="header">
        <div
          v-for="col in _.range(widths.length)"
          :key="col"
          class="flex place-content-center place-items-center"
        >
          <slot :name="`header-col-${col}`"></slot>
        </div>
      </div>
      <div>
        <div v-for="index in _.range(bodyCount)" :key="index" class="item">
          <div
            v-for="col in _.range(widths.length)"
            :key="col"
            class="flex place-content-center place-items-center gap-x-1"
          >
            <div class="label">
              <slot :name="`header-col-${col}`"></slot>
              <div>:</div>
            </div>
            <slot :name="`content-col-${col}`" :index="index"></slot>
          </div>
        </div>
      </div>
      <div
        v-if="
          Object.keys($slots).some((perm) => perm.startsWith('footer-col-'))
        "
        class="item"
      >
        <div
          v-for="col in _.range(widths.length)"
          :key="col"
          class="flex place-content-center place-items-center gap-x-1"
        >
          <div class="label">
            <slot :name="`header-col-${col}`"></slot>
            <div>:</div>
          </div>
          <slot :name="`footer-col-${col}`"><div></div></slot>
        </div>
      </div>
      <div v-if="'footer' in $slots" class="w-full py-2">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";

interface Props {
  widths: string[];
  bodyCount: number;
}

const props = defineProps<Props>();
const computedWidths = computed(() => props.widths.join(" "));

const headerElement = ref<HTMLElement>(null);
const containerElement = ref<HTMLElement>(null);

const { width: headerWidth } = useElementSize(headerElement);
const { width: containerWidth } = useElementSize(containerElement);

const small = computed(() => containerWidth.value < headerWidth.value);
</script>

<style scoped>
.header {
  display: grid;
  grid-template-columns: v-bind("computedWidths");
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.item {
  display: grid;
  grid-template-columns: v-bind("computedWidths");
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.label {
  display: none;
}

.small .header {
  position: absolute;
  visibility: hidden;
}

.small .item {
  display: flex;
  flex-direction: column;
}

.small .label {
  display: flex;
}
</style>
