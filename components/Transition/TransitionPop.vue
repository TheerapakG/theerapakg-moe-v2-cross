<template>
  <Transition
    enter-from-class="scale-0"
    leave-to-class="scale-0"
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-300 ease-out"
  >
    <slot />
  </Transition>
</template>
