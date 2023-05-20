<template>
  <div ref="containerElement">
    <div
      class="relative mx-auto flex max-w-max flex-col place-content-center place-items-center rounded-lg bg-gray-300 px-4 dark:bg-gray-600"
      :class="{ small, 'divide-y': !small }"
    >
      <div
        class="mx-auto flex w-full flex-col place-content-center place-items-center"
      >
        <div v-if="'header' in $slots" class="w-full py-2">
          <slot name="header"></slot>
        </div>
        <div
          ref="headerElement"
          class="header"
          :class="{ hide: !props.tableHeader }"
        >
          <div
            v-for="col in _.range(widths.length)"
            :key="col"
            class="flex place-content-center place-items-center"
          >
            <slot :name="`header-col-${col}`"></slot>
          </div>
        </div>
      </div>
      <div
        class="mx-auto flex w-full flex-col place-content-center place-items-center"
      >
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

type Props = {
  widths: string[];
  bodyCount: number;
  tableHeader?: boolean;
};

const props = withDefaults(defineProps<Props>(), { tableHeader: true });
const computedWidths = computed(() => props.widths.join(" "));

const headerElement = ref<HTMLElement | null>(null);
const containerElement = ref<HTMLElement | null>(null);

const { width: headerWidth } = useElementSize(headerElement);
const { width: containerWidth } = useElementSize(containerElement);

const small = computed(() => containerWidth.value < headerWidth.value);
</script>

<style scoped>
.header {
  display: grid;
  grid-template-columns: v-bind("computedWidths");
  column-gap: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.header.hide {
  position: absolute;
  visibility: hidden;
  padding-top: 0rem;
  padding-bottom: 0rem;
}

.item {
  display: grid;
  grid-template-columns: v-bind("computedWidths");
  column-gap: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.label {
  display: none;
}

.small .header {
  position: absolute;
  visibility: hidden;
  padding-top: 0rem;
  padding-bottom: 0rem;
}

.small .item {
  display: flex;
  flex-direction: column;
}

.small .label {
  display: flex;
}
</style>
