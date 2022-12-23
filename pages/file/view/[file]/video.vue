<template>
  <div class="relative flex flex-col place-content-start place-items-center">
    <div
      class="flex w-full flex-grow place-content-center place-items-center overflow-auto"
    >
      <video
        controls
        preload="metadata"
        :src="`/api/file/${$route.params.file}/download`"
      />
    </div>
  </div>
</template>
