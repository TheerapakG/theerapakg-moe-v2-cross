<script setup lang="ts">
type Props = {
  containerId: string;
};

const props = defineProps<Props>();

const { data: rawLogs } = useApiFetch(
  `/api/container/${props.containerId}/logs`,
);

const utf8Logs = computedAsync(() =>
  Promise.all(
    rawLogs.value?.map(async ({ type, time, msg }) => {
      return {
        type,
        time,
        msg: new TextDecoder().decode(
          await (
            await fetch(`data:application/octet-stream;base64,${msg}`)
          ).arrayBuffer(),
        ),
      };
    }) ?? [],
  ),
);
</script>

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
