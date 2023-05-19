<template>
  <div class="pointer-events-none">
    <slot v-if="!nativeAvailable" name="fallback" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

interface Props {
  toastStoreId: string;
}

const props = defineProps<Props>();
const { toastStoreId } = toRefs(props);

const nativeAvailable = ref(false);

const toastStore = useToastStore(toastStoreId.value);
const { toasts } = storeToRefs(toastStore);

onMounted(async () => {
  if (!!window && "Notification" in window) {
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    nativeAvailable.value = permission === "granted";
  }

  if (nativeAvailable.value) {
    const spawnNotification = (id: string) => {
      if (id) {
        const toast = toasts.value[id];
        const { show, close, onClose } = useWebNotification({
          title: typeof toast.title === "string" ? toast.title : toast.altTitle,
          body: toast.description
            ? typeof toast.description === "string"
              ? toast.description
              : toast.altDescription
            : undefined,
          tag: id,
          requireInteraction: true,
        });

        onClose(() => toastStore.kill(id));
        toast.onKilled.on(close);

        show();
      }
    };

    useMap(useKeys(toasts.value), spawnNotification);
    toastStore.onSpawned.on(spawnNotification);

    tryOnScopeDispose(() => {
      toastStore.onSpawned.off(spawnNotification);
    });
  }
});
</script>
