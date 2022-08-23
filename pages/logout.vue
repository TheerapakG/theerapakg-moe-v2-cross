<template>
  <div v-if="!sessionStore.id">You are not logged in!</div>
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

const sessionStore = useSessionStore();
const toastStore = useToastStore("layout");

const pending = ref(false);

const logout = async () => {
  pending.value = true;

  const { status } = await $fetch("/api/file/logout", {
    method: "POST",
  });

  pending.value = false;

  if (status < 0) {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    toastStore.spawn({
      title: "Logout Error",
      description: "Cannot log out.",
      icon: h(ExclamationCircleIcon),
    });
  } else {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    toastStore.spawn({
      title: "Logout Success",
      description: "Successfully logged out.",
      icon: h(ExclamationCircleIcon),
    });
    await navigateTo({
      path: "/",
    });
  }
};
</script>
