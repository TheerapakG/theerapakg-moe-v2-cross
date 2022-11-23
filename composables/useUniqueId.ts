export const useUniqueId = (prefix = "") => {
  const idCounter = useState<Record<string, number>>(
    `unique-id-${prefix}`,
    () => {
      return {};
    }
  );

  if (!idCounter.value[prefix]) {
    idCounter.value[prefix] = 0;
  }

  const id = ++idCounter.value[prefix];

  return `${prefix}${id}`;
};
