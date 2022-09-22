<template>
  <div v-if="!current || current.id === 'default'">You are not logged in!</div>
  <div v-else>
    <div class="text-4xl m-8">LOGOUT</div>
    <button
      class="rounded-lg w-32 h-12 m-4 bg-black dark:bg-white text-white font-bold dark:text-black"
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
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    toastStore.spawn({
      title: "Logout Error",
      description: "Cannot log out.",
      icon: h(ExclamationCircleIcon),
    });
    return;
  }

  pending.value = false;
  const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
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
