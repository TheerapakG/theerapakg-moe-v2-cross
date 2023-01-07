<template>
  <div class="px-8 md:px-24">
    <div v-if="utf8Logs" class="text-left">
      <div v-for="log in utf8Logs" :key="log.msg">
        <div>[{{ log.type }}] {{ log.msg }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { data: logs } = await useApiFetch(
  `/api/container/${route.params.id}/logs`
);

const utf8Logs = asyncComputed(async () => {
  const logPromises = logs?.value?.map(async ({ type, msg }) => {
    return {
      type,
      msg: new TextDecoder().decode(
        await (
          await fetch(`data:application/octet-stream;base64,${msg}`)
        ).arrayBuffer()
      ),
    };
  });
  return logPromises ? await Promise.all(logPromises) : undefined;
});
</script>
