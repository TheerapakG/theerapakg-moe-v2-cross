import { defineStore } from "pinia";
import { Ref, VNode } from "vue";
import { EventHook, Stoppable } from "@vueuse/shared";

type BaseToastTitleOpt =
  | {
      title: string;
      altTitle?: never;
    }
  | {
      title: VNode;
      altTitle: string;
    };

type BaseToastDescription =
  | {
      description?: string;
      altDescription?: never;
    }
  | {
      description: VNode;
      altDescription: string;
    };

interface Action {
  title: string;
  action: () => unknown;
}

type BaseToast = BaseToastTitleOpt &
  BaseToastDescription & {
    icon?: string | VNode;
    actions?: { [name: string]: Action };
  };

export type ToastOptions = BaseToast & {
  expire?: number;
  killable?: boolean;
};

export type Toast = BaseToast & {
  spawn: number;
  expire?: number;
  expireTimeout?: Stoppable;
  killable: boolean;
  onKilled: EventHook<void>;
};

export const useToastStore = (storeId: string) =>
  defineStore(`toast-${storeId}`, () => {
    const toasts: Ref<{ [id: string]: Toast }> = ref({});
    const onSpawned = createEventHook<string>();
    const onKilled = createEventHook<string>();

    const kill = (id: string) => {
      toasts.value?.[id]?.expireTimeout?.stop();
      toasts.value?.[id]?.onKilled.trigger();
      onKilled.trigger(id);
      delete toasts.value[id];
    };

    const spawn = (option: ToastOptions) => {
      const id = useUniqueId(`toast-${storeId}-`);

      toasts.value[id] = useAssign(
        {
          spawn: Date.now(),
          killable: true,
          onKilled: createEventHook<void>(),
        },
        option
      );

      const setupExpireTimeoutWatcher = () => {
        const { expire } = toasts.value[id];
        if (!expire) return;

        toasts.value[id].expireTimeout = useTimeoutFnNoGuard(() => {
          console.log(`toast: id ${id}: maybe expire`);
          const { expire } = toasts.value[id];
          if (!expire) return;
          if (expire > Date.now()) {
            setupExpireTimeoutWatcher();
            return;
          }
          kill(id);
        }, expire - Date.now());
      };

      const setupWatcher = () => {
        setupExpireTimeoutWatcher();
      };

      setupWatcher();
      onSpawned.trigger(id);
    };

    return {
      toasts,
      onSpawned,
      onKilled,
      kill,
      spawn,
    };
  })();
