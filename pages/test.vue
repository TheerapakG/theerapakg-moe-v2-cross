<template>
  <div>
    <div>
      <NuxtLink to="/test"> to test </NuxtLink>
      <NuxtLink to="/test2"> to test 2 </NuxtLink>
    </div>
    <ClientOnly>
      <div>tauri: {{ tauri }}</div>
    </ClientOnly>
    <input type="file" />
    <TabbedView class="w-[32rem]" :views="views" @remove-view="removeView" />
  </div>
</template>

<script setup lang="ts">
import { QuestionMarkCircleIcon } from "@heroicons/vue/outline";
import MonacoEditer from "~/components/MonacoEditer.vue";
import VNodeTemplate from "~/components/VNodeTemplate.vue";

definePageMeta({
  title: "theerapakg-moe-app",
  pageTransition: {
    name: "slide-left-uni",
    mode: "out-in",
  },
  name: "Test",
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const toastStore = useToastStore("layout");

const tauri = ref<string | boolean>("unknown");

const views = reactive({
  [useUniqueId("test_view")]: {
    name: "some really long name 1",
    node: h(VNodeTemplate, {
      renderNode: h(MonacoEditer, {
        class: "h-64",
      }),
    }),
    closable: true,
  },
  [useUniqueId("test_view")]: {
    name: "some really long name 2",
    node: h(VNodeTemplate, {
      renderNode: h("input", {
        class: "input-default",
      }),
    }),
    closable: true,
  },
  [useUniqueId("test_view")]: {
    name: "3",
    node: h(VNodeTemplate, {
      renderNode: h(MonacoEditer, {
        class: "h-64",
      }),
    }),
    closable: true,
  },
  [useUniqueId("test_view")]: {
    name: "4",
    node: h(VNodeTemplate, {
      renderNode: h("input", {
        class: "input-default",
      }),
    }),
    closable: true,
  },
  [useUniqueId("test_view")]: {
    name: "last is also really long",
    node: h(VNodeTemplate, {
      renderNode: h("input", {
        class: "input-default",
      }),
    }),
    closable: false,
  },
});

const removeView = (id: string) => {
  delete views[id];
};

if (process.client) {
  await sleep(0);
  toastStore.spawn({
    title: "Title",
    description:
      "Some really really long description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc tincidunt urna lorem, sed ultricies velit sollicitudin vel. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent nunc ante, fermentum id massa sed, mollis laoreet ante. Curabitur mollis ut justo non congue. Aliquam ut ex metus. Sed ut vehicula elit. Fusce at tincidunt mauris. Maecenas id orci id dolor dictum sollicitudin. Nullam est lacus, eleifend sit amet cursus ut, aliquam vel eros. Phasellus quis diam ut mi dictum suscipit non sed risus.",
    icon: h(QuestionMarkCircleIcon),
    expire: Date.now() + 60000,
  });
  tauri.value = isTauri();
}
</script>
