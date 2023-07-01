<script setup lang="ts">
const userStore = useUserStore();
const current = await userStore.fetchCurrentComputed();

const toast = useToast();

const open = ref(false);

const pending = ref(false);

const logout = async () => {
  pending.value = true;

  try {
    await $apiFetch("/api/user/logout", {
      method: "POST",
    });
  } catch {
    pending.value = false;

    toast.add({
      title: "Logout Error",
      description: "Cannot log out.",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  }

  pending.value = false;
  open.value = false;

  toast.add({
    title: "Logout Success",
    description: "Successfully logged out.",
    icon: "i-heroicons-exclaimation-circle",
  });

  await userStore.fetchCurrent(true);

  await navigateTo({
    path: "/",
  });
};
</script>

<template>
  <div>
    <UButton
      label="logout"
      :disabled="
        !current || current.id === '00000000-0000-0000-0000-000000000000'
      "
      @click="open = true"
    />

    <UModal v-model="open">
      <UCard>
        <template #header>
          <div class="text-center text-4xl">LOGOUT</div>
        </template>

        <div class="flex place-content-center place-items-center">
          <UButton
            color="black"
            size="xl"
            :loading="pending"
            label="logout"
            @click="logout"
          />
        </div>
      </UCard>
    </UModal>
  </div>
</template>
