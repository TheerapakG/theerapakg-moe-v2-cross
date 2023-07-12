<script setup lang="ts">
type Props = {
  direction?: "left" | "right" | "left-uni" | "right-uni";
};

const props = withDefaults(defineProps<Props>(), { direction: "right" });
const { direction } = toRefs(props);

const enterFromClass = computed(() =>
  useIncludes(["left", "left-uni"], direction.value)
    ? "translate-x-full"
    : "-translate-x-full"
);
const leaveToClass = computed(() =>
  useIncludes(["left", "right-uni"], direction.value)
    ? "translate-x-full"
    : "-translate-x-full"
);
</script>

<template>
  <Transition
    :enter-from-class="enterFromClass"
    :leave-to-class="leaveToClass"
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-300 ease-in"
  >
    <slot />
  </Transition>
</template>
