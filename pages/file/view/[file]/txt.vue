<template>
  <div class="flex flex-col place-content-start place-items-center">
    <FileViewTxt
      :file-id="(route.params.file as string)"
      :lang="(route.params.lang as string | undefined)"
      :activate-portal="pageMounted"
      class="w-full flex-grow"
    />
  </div>
</template>

<script setup lang="ts">
import { mountedKey } from "../provides";

const route = useRoute();
const pageMounted = inject(mountedKey, ref(false));
</script>
