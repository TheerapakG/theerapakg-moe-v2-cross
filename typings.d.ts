// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="vue/macros-global" />

import "~/node_modules/nuxt/dist/pages/runtime/composables";

declare module "~/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    title?: string;
    name?: string | { [key: string]: { [key: string]: string } };
    perms?: string[];
  }
}
