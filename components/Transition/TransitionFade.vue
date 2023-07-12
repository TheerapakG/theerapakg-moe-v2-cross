<template>
  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition-opacity duration-300 ease-linear"
    leave-active-class="transition-opacity duration-300 ease-linear"
  >
    <slot />
  </Transition>
</template>
