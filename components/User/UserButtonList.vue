<script setup lang="ts">
type Props = {
  pending?: boolean;
  selected?: string[];
};

defineProps<Props>();

type Emits = {
  show: [string[]];
  add: [string];
  remove: [string];
};

const emit = defineEmits<Emits>();
</script>

<template>
  <UPopover>
    <slot>
      <UButton
        variant="ghost"
        size="xl"
        icon="i-heroicons-funnel"
        aria-label="filter users"
        :ui="{ rounded: 'rounded-full' }"
      />
    </slot>

    <template #panel>
      <UserList
        :pending="pending"
        :selected="selected"
        class="p-4"
        @show="(ids) => emit('show', ids)"
        @add="(id) => emit('add', id)"
        @remove="(id) => emit('remove', id)"
      />
    </template>
  </UPopover>
</template>
