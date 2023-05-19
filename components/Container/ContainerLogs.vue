<template>
  <div v-if="utf8Logs" class="text-left font-mono">
    <table
      v-for="log in utf8Logs"
      :key="log.msg"
      class="grid grid-cols-[18rem_minmax(0,1fr)]"
      :class="{ 'text-red-600 dark:text-red-400': log.type === 'stderr' }"
    >
      <td>{{ log.time }}</td>
      <td>{{ log.msg }}</td>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Props {
  containerId: string;
}

const props = defineProps<Props>();

const utf8Logs = ref<
  { type: "stdout" | "stderr"; time: string; msg: string }[]
>([]);

const useContainerSubscription = (containerId: string) => {
  const wsClient = useTRPCWs();
  utf8Logs.value = [];
  return wsClient.container.logs.subscribe(
    {
      id: containerId,
    },
    {
      onData: async ({ type, time, msg }) => {
        utf8Logs.value.push({
          type,
          time,
          msg: new TextDecoder().decode(
            await (
              await fetch(`data:application/octet-stream;base64,${msg}`)
            ).arrayBuffer()
          ),
        });
      },
    }
  );
};

onMounted(async () => {
  let subscription = useContainerSubscription(props.containerId);
  watch(
    () => props.containerId,
    () => {
      subscription.unsubscribe();
      subscription = useContainerSubscription(props.containerId);
    }
  );
  onUnmounted(() => subscription.unsubscribe);
});
</script>
