<template>
  <div>
    <div
      class="w-full"
      @focusin="
        isFocus = true;
        $emit('suggestion-argument', value);
      "
      @mouseenter="isMouse = true"
      @focusout="isFocus = false"
      @mouseleave="isMouse = false"
    >
      <div :class="inputContainerClass">
        <slot name="beforeinput"></slot>
        <input
          v-model.lazy="value"
          @input="$emit('suggestion-argument', $event.target.value)"
          class="w-full m-0"
          :class="inputClass"
          :placeholder="placeholder"
          ref="input"
        />
        <slot name="afterinput"></slot>
      </div>
      <div v-if="isFocus" class="relative w-full">
        <div
          class="absolute w-full rounded-lg bg-gray-200 dark:bg-gray-700 py-2"
        >
          <div v-if="!suggestions.resolved">
            <slot name="loadingsuggestion"> loading suggestions... </slot>
          </div>
          <div
            v-else-if="
              !suggestions.suggestions || suggestions.suggestions.length === 0
            "
          >
            <slot name="nosuggestion"> no suggestions found :( </slot>
          </div>
          <div
            v-else
            class="max-h-1/2screen w-full overflow-hidden overflow-y-scroll"
          >
            <div
              v-for="item in suggestions.suggestions"
              v-bind:key="item.value"
              class="w-full px-2 py-1"
            >
              <slot
                name="suggestion-item"
                :item="item"
                :click="() => setInputValue(item.value)"
              >
                <button
                  type="button"
                  @click="setInputValue(item.value)"
                  class="button-rounded suggestion-bg w-full"
                >
                  <slot name="suggestion-item-content" :item="item">
                    <div v-if="item.name">
                      <div class="font-bold truncate">{{ item.name }}</div>
                      <div class="font-light truncate">{{ item.value }}</div>
                    </div>
                    <div v-else class="font-light truncate">
                      {{ item.value }}
                    </div>
                  </slot>
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  watch,
} from "@vue/runtime-core";

export declare interface Suggestion {
  name?: string;
  value: string;
}

export declare interface InputSuggestions {
  resolved: boolean;
  suggestions?: Suggestion[];
}

export default defineComponent({
  props: {
    inputClass: {
      type: String,
      default: () => "input-rounded",
    },
    inputContainerClass: {
      type: String,
      default: () => "w-full m-0",
    },
    modelValue: {
      type: String,
      default: () => "",
    },
    placeholder: {
      type: String,
      default: () => "",
    },
    suggestions: {
      type: Object as PropType<InputSuggestions>,
      default: () => {
        return {
          resolved: true,
        };
      },
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ["update:modelValue"]: (payload: string) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ["suggestion-argument"]: (payload: string) => true,
  },
  setup(props, context) {
    const value = ref(props.modelValue);
    watch(
      () => props.modelValue,
      (modelValue) => {
        value.value = modelValue;
      }
    );
    watch(value, (value) => context.emit("update:modelValue", value));

    const input = ref<HTMLInputElement | undefined>(undefined);

    const setInputValue = (newValue: string) => {
      value.value = newValue;
      if (input.value) input.value.value = newValue;
      context.emit("suggestion-argument", newValue);
    };

    const isMouse = ref(false);
    const _isFocusValue = ref(false);

    const isFocus = computed({
      get: function () {
        return _isFocusValue.value;
      },
      set: function (value: boolean) {
        if (value || isMouse.value) {
          if (!_isFocusValue.value) {
            _isFocusValue.value = true;
            if (input.value) {
              input.value.focus();
            }
          }
        } else {
          _isFocusValue.value = false;
        }
      },
    });

    return {
      value,
      input,
      setInputValue,
      isMouse,
      isFocus,
    };
  },
});
</script>

<style scoped lang="scss">
.suggestion-bg {
  @apply bg-gray-100 dark:bg-gray-800;
}

.suggestion-bg:hover {
  @apply bg-white dark:bg-black;
}
</style>
