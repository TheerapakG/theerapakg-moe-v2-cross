<script setup lang="ts">
import UserList from "~/components/User/UserList.vue";

type Props = {
  fileId: string;
  perm: "view" | "edit";
};

const props = defineProps<Props>();
const { fileId, perm } = toRefs(props);
const filePermStore = useFilePermStore();

const userList = ref<string[]>([]);
const setUserList = (ids: string[]) => {
  userList.value = ids;
};

const permParams = computed(() => {
  return {
    users: userList?.value?.join(","),
  };
});

const {
  pending,
  data: rawPermList,
  refresh,
} = await useApiFetch(`/api/file/${props.fileId}/perm/${props.perm}/list`, {
  params: permParams,
});

const permList = computed(() => {
  return (
    rawPermList.value?.filter((user) => user.perm)?.map((user) => user.id) ?? []
  );
});

const addFilePermUser = async (user: string) => {
  await filePermStore.addFilePermUser(fileId.value, perm.value, user);
  await refresh();
};

const removeFilePermUser = async (user: string) => {
  await filePermStore.removeFilePermUser(fileId.value, perm.value, user);
  await refresh();
};
</script>

<template>
  <div
    class="flex w-full flex-col place-content-center place-items-center gap-y-2"
  >
    <div>changing permission: {{ perm }}</div>
    <UserList
      ref="userListEl"
      :pending="pending"
      :selected="permList"
      @show="setUserList"
      @add="addFilePermUser"
      @remove="removeFilePermUser"
    />
  </div>
</template>
