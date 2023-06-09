<template>
  <div v-if="!current || current.id === 'default'">You are not logged in!</div>
  <div v-else>
    <div class="m-8 text-4xl">LOGOUT</div>
    <UButton color="black" size="xl" label="logout" @click="logout()" />
  </div>
</template>

<script setup lang="tsx">
definePageMeta({
  title: "theerapakg-moe: logout",
  pageTransition: {
    name: "slide-left-uni",
    mode: "out-in",
  },
  name: "Logout",
});

const userStore = useUserStore();
const current = await userStore.useCurrent();

const toast = useToast();

const pending = ref(false);

const logout = async () => {
  pending.value = true;

  try {
    await $apiFetch("/api/user/logout", {
      method: "POST",
    });
  } catch {
    toast.add({
      title: "Logout Error",
      description: "Cannot log out.",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  }

  pending.value = false;
  toast.add({
    title: "Logout Success",
    description: "Successfully logged out.",
    icon: "i-heroicons-exclaimation-circle",
  });
  await Promise.all([
    userStore.refreshCurrent(),
    navigateTo({
      path: "/",
    }),
  ]);
};
</script>
