<template>
  <div>
    <UButton
      label="login"
      :disabled="
        !current || current.id !== '00000000-0000-0000-0000-000000000000'
      "
      @click="open = true"
    />

    <UModal v-model="open">
      <UCard>
        <template #header>
          <div class="text-center text-4xl">LOGIN</div>
        </template>

        <div class="flex flex-col place-content-center gap-y-4">
          <UFormGroup label="Username" :error="errorMsg">
            <UInput v-model="user" size="md" />
          </UFormGroup>
          <UFormGroup label="Password" :error="errorMsg">
            <UInput v-model="pass" type="password" size="md" />
          </UFormGroup>
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
import { FetchError } from "ofetch";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { current } = storeToRefs(userStore);
await userStore.fetchCurrent();

const toast = useToast();

const open = ref(false);

const user = ref("");
const pass = ref("");
const pending = ref(false);
const errorMsg = ref("");

const login = async () => {
  pending.value = true;
  errorMsg.value = "";

  await $apiFetch("/api/user/login", {
    method: "POST",
    body: {
      user: user.value,
      pass: pass.value,
    },
  }).then(
    async () => {
      pending.value = false;
      open.value = false;

      toast.add({
        title: "Login Success",
        description: "Successfully logged in.",
        icon: "i-heroicons-exclaimation-circle",
      });

      await userStore.fetchCurrent(true);
    },
    (error: FetchError) => {
      pending.value = false;

      if (error.statusCode === 403) {
        errorMsg.value = "Check username / password";
        toast.add({
          title: "Login Error",
          description: "Cannot log in. Check username / password.",
          icon: "i-heroicons-exclaimation-circle",
          color: "red",
        });
      } else throw error;
    }
  );
};
</script>
