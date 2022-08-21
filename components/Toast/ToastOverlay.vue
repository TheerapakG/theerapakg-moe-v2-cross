<template>
  <div
    class="flex flex-col justify-end md:justify-start content-center justify-items-end md:justify-items-start items-center pointer-events-none"
  >
    <ClientOnly>
      <ToastList
        class="relative w-64 md:w-full max-h-full"
        :toast-store-id="toastStoreId"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
interface Props {
  toastStoreId: string;
}

const props = defineProps<Props>();
const { toastStoreId } = toRefs(props);
</script>
