<template>
  <div v-if="!current || current.id === 'default'">You are not logged in!</div>
  <div v-else>
    <div class="m-8 text-4xl">LOGOUT</div>
    <button
      class="m-4 h-12 w-32 rounded-lg bg-black font-bold text-white dark:bg-white dark:text-black"
      @click="logout()"
    >
      Logout
    </button>
  </div>
</template>

<script setup lang="ts">
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

const toastStore = useToastStore("layout");

const pending = ref(false);

const logout = async () => {
  pending.value = true;

  try {
    await $apiFetch("/api/user/logout", {
      method: "POST",
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Logout Error",
      description: "Cannot log out.",
      icon: h(ExclamationCircleIcon),
    });
    return;
  }

  pending.value = false;
  const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
  toastStore.spawn({
    title: "Logout Success",
    description: "Successfully logged out.",
    icon: h(ExclamationCircleIcon),
  });
  await Promise.all([
    userStore.refreshCurrent(),
    navigateTo({
      path: "/",
    }),
  ]);
};
</script>
