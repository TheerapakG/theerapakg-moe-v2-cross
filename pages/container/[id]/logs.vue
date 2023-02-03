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

const utf8Logs = ref<{ type: "stdout" | "stderr"; msg: string }[]>([]);

onMounted(async () => {
  const { $wsClient } = useNuxtApp();
  await $wsClient.container.logs.subscribe(
    {
      id: route.params.id as string,
    },
    {
      onData: async ({ type, msg }) => {
        utf8Logs.value.push({
          type,
          msg: new TextDecoder().decode(
            await (
              await fetch(`data:application/octet-stream;base64,${msg}`)
            ).arrayBuffer()
          ),
        });
      },
    }
  );
});
</script>
