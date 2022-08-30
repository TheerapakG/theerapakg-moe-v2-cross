export const useUserInfo = async (id: string) => {
  const { refresh, pending, data, error } = await useFetch(
    `/api/user/${id}/info`
  );

  return {
    refresh,
    pending,
    error,
    id,
    data: computed(() => data.value.value),
  };
};
