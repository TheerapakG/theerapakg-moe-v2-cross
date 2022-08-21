<template>
  <div class="tokenselector">
    <button
      type="button"
      @click="tokenSelectorModalState = ModalState.open"
      class="button-rounded tokenselector-bg w-full text-white dark:text-black"
    >
      {{ selectedToken?.name ?? "select token" }}
    </button>
    <GenericModal v-model:modalState="tokenSelectorModalState">
      <template v-slot:body>
        <h3 class="text-left mb-4 pl-2">Select Token:</h3>
        <div class="horizontal-line"></div>

        <div v-if="tokenList === undefined" class="mt-4 w-120">
          loading list...
        </div>
        <div v-else-if="tokenList.length === 0" class="mt-4 w-120">
          cannot get token list :(
        </div>
        <div
          v-else
          class="max-h-1/2screen mt-4 w-120 overflow-hidden overflow-y-scroll"
        >
          <div
            v-for="item in tokenList"
            v-bind:key="item.address"
            class="w-full px-2 py-1"
          >
            <button
              type="button"
              @click="
                $emit('select-token', item.address);
                tokenSelectorModalState = ModalState.close;
              "
              class="button-rounded tokenselector-bg w-full"
            >
              <div>
                <span>{{ item.userBalance ?? "loading" }}</span>
                <span class="font-bold">{{ item.symbol }}</span>
              </div>
              <div class="font-light truncate">{{ item.address }}</div>
            </button>
          </div>
        </div>
      </template>
    </GenericModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "@vue/runtime-core";

import {
  ModalState,
  default as GenericModal,
} from "@/components/modals/GenericModal.vue";

export declare interface ERC20WithBalance {
  address: string;
  userBalance: string | undefined;
  decimals: number;
  symbol: string;
  name: string;
  totalSupply: string;
  circulatingSupply: string;
}

export default defineComponent({
  props: {
    selectedToken: {
      type: Object as PropType<ERC20WithBalance>,
    },
    tokenList: {
      type: Object as PropType<ERC20WithBalance[]>,
    },
  },
  components: {
    GenericModal,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup(props, context) {
    const tokenSelectorModalState = ref(ModalState.close);

    return {
      tokenSelectorModalState,
      ModalState,
    };
  },
});
</script>

<style scoped lang="scss">
.tokenselector-bg {
  @apply bg-gray-800 dark:bg-gray-100;
}

.tokenselector-bg:hover {
  @apply bg-black dark:bg-white;
}
</style>
