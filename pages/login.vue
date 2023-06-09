<template>
  <div v-if="current && current.id !== 'default'">You are logged in!</div>
  <div v-else>
    <div class="m-8 text-4xl">LOGIN</div>
    <div class="m-4">
      username: <UInput v-model="user" class="inline-block w-80" size="md" />
    </div>
    <div class="m-4">
      password:
      <UInput
        v-model="pass"
        type="password"
        class="inline-block w-80"
        size="md"
      />
    </div>
    <UButton color="black" size="xl" label="login" @click="login()" />
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

const toast = useToast();

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
    toast.add({
      title: "Login Error",
      description: "Cannot log in. Check username/password.",
      icon: "i-heroicons-exclaimation-circle",
      color: "red",
    });
    return;
  }

  pending.value = false;

  toast.add({
    title: "Login Success",
    description: "Successfully logged in.",
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
