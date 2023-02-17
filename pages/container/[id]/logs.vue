<template>
  <div class="px-8 md:px-24">
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
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const utf8Logs = ref<
  { type: "stdout" | "stderr"; time: string; msg: string }[]
>([]);

onMounted(async () => {
  const wsClient = useTRPCWs();
  const subscription = wsClient.container.logs.subscribe(
    {
      id: route.params?.id as string,
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
  onUnmounted(subscription.unsubscribe);
});
</script>
