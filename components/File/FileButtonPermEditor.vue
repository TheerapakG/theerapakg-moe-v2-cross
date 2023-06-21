<template>
  <div class="relative">
    <UPopover>
      <slot :perm-user-count="permUserCount">
        <UButton :label="`${permUserCount} users`" />
      </slot>

      <template #panel>
        <FilePermEditor
          :file-id="fileId"
          :perm="perm"
          class="p-4"
          @refresh="refresh"
        />
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
type Props = {
  fileId: string;
  perm: string;
};

const props = defineProps<Props>();

const fetch = computed(() =>
  useApiFetch(`/api/file/${props.fileId}/perm/${props.perm}/count`)
);

const data = computed(() => fetch.value.data.value);
const refresh = computed(() => fetch.value.refresh);

const permUserCount = computed(() => data.value?.count);
</script>
