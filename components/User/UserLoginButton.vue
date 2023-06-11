<template>
  <div>
    <UButton
      label="login"
      :disabled="!current || current.id !== 'default'"
      @click="open = true"
    />

    <UModal v-model="open">
      <UCard>
        <template #header>
          <div class="text-center text-4xl">LOGIN</div>
        </template>

        <div
          class="flex flex-col place-content-center place-items-center gap-y-2"
        >
          <div class="flex place-content-center place-items-center gap-x-2">
            username:
            <UInput v-model="user" class="inline-block w-80" size="md" />
          </div>
          <div class="flex place-content-center place-items-center gap-x-2">
            password:
            <UInput
              v-model="pass"
              type="password"
              class="inline-block w-80"
              size="md"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex place-content-center place-items-center">
            <UButton
              color="black"
              size="xl"
              :loading="pending"
              label="login"
              @click="login"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { current } = storeToRefs(userStore);
await userStore.fetchCurrent();

const toast = useToast();

const open = ref(false);

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
  open.value = false;

  toast.add({
    title: "Login Success",
    description: "Successfully logged in.",
    icon: "i-heroicons-exclaimation-circle",
  });

  await userStore.fetchCurrent(true);
};
</script>
