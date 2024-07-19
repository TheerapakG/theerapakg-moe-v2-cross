<script setup lang="ts">
type Props = {
  containerId: string;
  ariaLabel?: string;
};

const props = defineProps<Props>();
const { containerId } = toRefs(props);

type Emits = {
  delete: [];
};

const emit = defineEmits<Emits>();

const containerStore = useContainerStore();

const openModalKill = ref(false);
const openModalDelete = ref(false);

const items = computed(() => {
  return [
    [
      {
        label: "Logs",
        icon: "i-heroicons-document-text",
        to: `/container/${containerId.value}/logs`,
      },
    ],
    [
      {
        label: "Pause",
        icon: "i-heroicons-pause",
        click: () => containerStore.pauseContainer(containerId.value),
      },
      {
        label: "Unpause",
        icon: "i-heroicons-play",
        click: () => containerStore.unpauseContainer(containerId.value),
      },
    ],
    [
      {
        label: "Kill",
        icon: "i-heroicons-stop",
        click: () => (openModalKill.value = true),
      },
    ],
    [
      {
        label: "Delete",
        icon: "i-heroicons-minus",
        click: () => (openModalDelete.value = true),
      },
    ],
  ];
});
</script>

<template>
  <div>
    <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
      <UButton
        variant="ghost"
        size="xl"
        icon="i-heroicons-ellipsis-horizontal-20-solid"
        :aria-label="ariaLabel"
        :ui="{ rounded: 'rounded-full' }"
      />
    </UDropdown>

    <ContainerModalKill v-model="openModalKill" :container-id="containerId" />
    <ContainerModalDelete
      v-model="openModalDelete"
      :container-id="containerId"
      @delete="emit('delete')"
    />
  </div>
</template>
