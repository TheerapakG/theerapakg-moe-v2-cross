<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileEditTxt
      :file-id="(route.params.file as string)"
      :lang="(route.params.lang as string | undefined)"
      :activate-portal="mountedState"
      class="w-full flex-grow"
    />
  </div>
</template>

<script setup lang="ts">
import { useMountedState } from "../states";

const mountedState = useMountedState();

const route = useRoute();
</script>
