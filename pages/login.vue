<template>
  <div v-if="current && current.id !== 'default'">You are logged in!</div>
  <div v-else>
    <div class="text-4xl m-8">LOGIN</div>
    <div class="m-4">
      username: <input v-model="user" class="input-default" />
    </div>
    <div class="m-4">
      password: <input v-model="pass" type="password" class="input-default" />
    </div>
    <button
      class="rounded-lg w-32 h-12 m-4 bg-black dark:bg-white text-white font-bold dark:text-black"
      @click="login()"
    >
      Login
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: "theerapakg-moe: login",
  pageTransition: {
    name: "slide-left-uni",
    mode: "out-in",
  },
  name: "Login",
});

const config = useRuntimeConfig();

const userStore = useUserStore();
const current = await userStore.useCurrent();

const toastStore = useToastStore("layout");

const user = ref("");
const pass = ref("");
const pending = ref(false);

const login = async () => {
  pending.value = true;

  const { status } = await $fetch("/api/user/login", {
    baseURL: config.public?.apiBaseURL ?? "/",
    method: "POST",
    body: {
      user: user.value,
      pass: pass.value,
    },
  });

  pending.value = false;

  if (status < 0) {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    toastStore.spawn({
      title: "Login Error",
      description: "Cannot log in. Check username/password.",
      icon: h(ExclamationCircleIcon),
    });
  } else {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/outline");
    toastStore.spawn({
      title: "Login Success",
      description: "Successfully logged in.",
      icon: h(ExclamationCircleIcon),
    });
    await Promise.all([
      userStore.refreshCurrent(),
      navigateTo({
        path: "/",
      }),
    ]);
  }
};
</script>
