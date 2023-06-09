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
          @user-count="setPermUserCount"
        />
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
type Props = {
  fileId: string;
  perm: string;
  userCount: number;
};

const props = defineProps<Props>();

const { userCount } = toRefs(props);

const permUserCount = ref(userCount.value);
const setPermUserCount = (userCount: number) => {
  permUserCount.value = userCount;
};
watch(userCount, () => setPermUserCount(userCount.value));
</script>
