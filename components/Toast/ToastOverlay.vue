<template>
  <div
    class="pointer-events-none flex flex-col content-center items-center justify-end justify-items-end md:justify-start md:justify-items-start"
  >
    <ClientOnly>
      <ToastList
        class="relative max-h-full w-64 md:w-full"
        :toast-store-id="toastStoreId"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
type Props = {
  toastStoreId: string;
};

const props = defineProps<Props>();
const { toastStoreId } = toRefs(props);
</script>
