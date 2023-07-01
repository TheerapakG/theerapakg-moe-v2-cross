<script setup lang="tsx">
import { UInput } from "#components";
import VNodeTemplate from "~/components/VNodeTemplate.vue";

definePageMeta({
  title: "theerapakg-moe-app",
  pageTransition: {
    name: "slide-left-uni",
    mode: "out-in",
  },
  name: "Test",
});

const tauri = ref<string | boolean>("unknown");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const views = reactive<Record<string, any>>({});

const removeView = (id: string) => {
  delete views[id];
};

onMounted(async () => {
  tauri.value = isTauri();

  const MonacoEditor = resolveComponent("MonacoEditor");

  views[useUniqueId("test_view")] = {
    name: "some really long name 1",
    node: (
      <VNodeTemplate
        renderNode={h(MonacoEditor, {
          class: "h-64",
        })}
      />
    ),
    closable: true,
  };
  views[useUniqueId("test_view")] = {
    name: "some really long name 2",
    node: <UInput />,
    closable: true,
  };
  views[useUniqueId("test_view")] = {
    name: "3",
    node: (
      <VNodeTemplate
        renderNode={h(MonacoEditor, {
          class: "h-64",
        })}
      />
    ),
    closable: true,
  };
  views[useUniqueId("test_view")] = {
    name: "4",
    node: <UInput />,
    closable: true,
  };
  views[useUniqueId("test_view")] = {
    name: "last is also really long",
    node: <UInput />,
    closable: false,
  };
});
</script>

<template>
  <div>
    <ClientOnly>
      <div>tauri: {{ tauri }}</div>
    </ClientOnly>
    <TabbedView class="w-[32rem]" :views="views" @remove-view="removeView" />
  </div>
</template>
