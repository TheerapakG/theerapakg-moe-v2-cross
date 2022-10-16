<template>
  <div class="pointer-events-none">
    <ClientOnly>
      <ToastListImpl class="h-full w-full" :toast-store-id="toastStoreId" />
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
