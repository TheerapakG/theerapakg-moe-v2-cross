<template>
  <div v-if="current && current.id !== 'default'">You are logged in!</div>
  <div v-else>
    <div class="m-8 text-4xl">LOGIN</div>
    <div class="m-4">
      username: <input v-model="user" class="input-default" />
    </div>
    <div class="m-4">
      password: <input v-model="pass" type="password" class="input-default" />
    </div>
    <button class="button-default m-4 h-12 w-32" @click="login()">Login</button>
  </div>
</template>

<script setup lang="tsx">
definePageMeta({
  title: "theerapakg-moe: login",
  pageTransition: {
    name: "slide-left-uni",
    mode: "out-in",
  },
  name: "Login",
});

const userStore = useUserStore();
const current = await userStore.useCurrent();

const toastStore = useToastStore("layout");

const user = ref("");
const pass = ref("");
const pending = ref(false);

const login = async () => {
  pending.value = true;

  try {
    await $apiFetch("/api/user/login", {
      method: "POST",
      body: {
        user: user.value,
        pass: pass.value,
      },
    });
  } catch {
    const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
    toastStore.spawn({
      title: "Login Error",
      description: "Cannot log in. Check username/password.",
      icon: <ExclamationCircleIcon />,
    });
    return;
  }

  pending.value = false;

  const { ExclamationCircleIcon } = await import("@heroicons/vue/24/outline");
  toastStore.spawn({
    title: "Login Success",
    description: "Successfully logged in.",
    icon: <ExclamationCircleIcon />,
  });
  await Promise.all([
    userStore.refreshCurrent(),
    navigateTo({
      path: "/",
    }),
  ]);
};
</script>
