<script setup lang="ts">
import {
  clamp,
  max,
  min,
  range,
  sortedLastIndex,
  sortedIndex,
  zip,
} from "lodash-es";

definePageMeta({
  title: "theerapakg-moe-app: wish pieces gacha simulator",
  name: "Wish Pieces Gacha Simulator",
});

const wishPieces = ref(0);
const onePull = ref(false);
const colorFes = ref(false);
const percentile = ref(50);

type PullRate = {
  rate: { amount: number; probability: number }[];
  count: number;
};

const expectedRate: Record<string, PullRate[]> = {
  onepull_normal: [
    {
      rate: [
        { amount: 5, probability: 0.885 },
        { amount: 50, probability: 0.085 },
        { amount: 2000, probability: 0.03 },
      ],
      count: 1,
    },
  ],
  onepull_colorfes: [
    {
      rate: [
        { amount: 5, probability: 0.855 },
        { amount: 50, probability: 0.085 },
        { amount: 2000, probability: 0.06 },
      ],
      count: 1,
    },
  ],
  tenpull_normal: [
    {
      rate: [
        { amount: 5, probability: 0.885 },
        { amount: 50, probability: 0.085 },
        { amount: 2000, probability: 0.03 },
      ],
      count: 9,
    },
    {
      rate: [
        { amount: 50, probability: 0.97 },
        { amount: 2000, probability: 0.03 },
      ],
      count: 1,
    },
  ],
  tenpull_colorfes: [
    {
      rate: [
        { amount: 5, probability: 0.855 },
        { amount: 50, probability: 0.085 },
        { amount: 2000, probability: 0.06 },
      ],
      count: 9,
    },
    {
      rate: [
        { amount: 50, probability: 0.94 },
        { amount: 2000, probability: 0.06 },
      ],
      count: 1,
    },
  ],
};
const currentRate = computed(
  () =>
    expectedRate[
      `${onePull.value ? "onepull" : "tenpull"}_${colorFes.value ? "colorfes" : "normal"}`
    ],
);
const minResult = computed(() =>
  Math.ceil(
    wishPieces.value /
      currentRate.value
        .map(
          ({ rate, count }) =>
            (max(rate.map(({ amount }) => amount)) ?? 0) * count,
        )
        .reduce((s, rate) => s + rate, 0),
  ),
);
const maxResult = computed(() =>
  Math.ceil(
    wishPieces.value /
      currentRate.value
        .map(
          ({ rate, count }) =>
            (min(rate.map(({ amount }) => amount)) ?? 0) * count,
        )
        .reduce((s, rate) => s + rate, 0),
  ),
);
const totalPerPull = computed(() =>
  currentRate.value.reduce((s, { count }) => s + count, 0),
);
const simulationResultArray = ref<number[]>([]);
const simulationResultObject = ref<Map<number, number>>(new Map());
const simulationResultKeys = computed(() => [
  ...simulationResultObject.value.keys(),
]);
const simulationRangeStart = computed(() => min(simulationResultKeys.value));
const simulationRangeEnd = computed(() => max(simulationResultKeys.value));
const binSize = computed(() =>
  simulationRangeStart.value && simulationRangeEnd.value
    ? Math.ceil(
        (simulationRangeEnd.value - simulationRangeStart.value + 1) / 256,
      )
    : 1,
);
const simulationRange = computed(() =>
  simulationRangeStart.value && simulationRangeEnd.value
    ? range(
        simulationRangeStart.value,
        simulationRangeEnd.value + 1,
        binSize.value,
      )
    : undefined,
);
const percentilePosition = computed(() =>
  clamp(
    Math.ceil((percentile.value / 100) * simulationResultArray.value.length),
    0,
    simulationResultArray.value.length - 1,
  ),
);
const percentileResult = computed(() =>
  simulationResultArray.value.length > 0
    ? simulationResultArray.value[percentilePosition.value]
    : undefined,
);
const hoverIndex = ref<number>();
const percentileIndex = computed(() =>
  simulationRange.value && percentileResult.value
    ? sortedLastIndex(simulationRange.value, percentileResult.value) - 1
    : undefined,
);
const graphResult = computed(() =>
  simulationRange.value?.map((i) => {
    return {
      start: i,
      end: i + binSize.value - 1,
      count: range(i, i + binSize.value)
        .map((j) => simulationResultObject.value.get(j) ?? 0)
        .reduce((s, res) => s + res, 0),
    };
  }),
);
const graphResultModeValue = computed(() =>
  graphResult.value
    ? max(graphResult.value.map(({ count }) => count))
    : undefined,
);

const config = computed(() => {
  return {
    wishPieces: wishPieces.value,
    onePull: onePull.value,
    colorfes: colorFes.value,
  };
});
watch(
  config,
  () => {
    simulationResultArray.value = [];
    simulationResultObject.value = new Map();
  },
  { immediate: true },
);

const idleCallbackId = ref<number>();

const runSimulation = (deadline: IdleDeadline) => {
  const cdfsArr = currentRate.value.flatMap(({ rate, count }) =>
    Array<{ cdf: number; amount: number }[]>(count).fill(
      rate.map(
        (
          (cdf) =>
          ({ amount, probability }) => {
            cdf += probability;
            return {
              cdf,
              amount,
            };
          }
        )(0),
      ),
    ),
  );
  while (
    deadline.timeRemaining() > 0 &&
    simulationResultArray.value.length < 10000
  ) {
    let round = 0;
    let currentWishPieces = 0;
    while (config.value.wishPieces > currentWishPieces) {
      currentWishPieces += zip(
        Array.from(cdfsArr, () => Math.random()),
        cdfsArr,
      )
        .map(([rand, cdfs]) =>
          rand ? cdfs?.find(({ cdf }) => cdf > rand) : undefined,
        )
        .filter(Boolean)
        .reduce((s, { amount }) => s + amount, 0);
      round += 1;
    }

    simulationResultArray.value.splice(
      sortedIndex(simulationResultArray.value, round),
      0,
      round,
    );

    simulationResultObject.value.set(
      round,
      (simulationResultObject.value.get(round) ?? 0) + 1,
    );
  }
  idleCallbackId.value = requestIdleCallback(runSimulation);
};

onMounted(async () => {
  idleCallbackId.value = requestIdleCallback(runSimulation);
});

onUnmounted(() => {
  if (idleCallbackId.value) cancelIdleCallback(idleCallbackId.value);
});

const url = useRequestURL();

useSeoMeta({
  ogTitle: "theerapakg-moe-app: wish pieces gacha simulator",
  ogType: "website",
  ogUrl: url.origin + url.pathname,
});
</script>

<template>
  <UContainer
    class="thin-scrollbars relative flex flex-col place-content-center place-items-center gap-y-2 overflow-x-auto pt-0 md:pt-16 2xl:pt-0"
  >
    <div class="flex place-content-start place-items-center gap-3">
      <div>TO GET</div>
      <UInput v-model="wishPieces" size="xl" />
      <div>WISH PIECES</div>
    </div>
    <div class="flex place-content-start place-items-center gap-3">
      <div>WITH</div>
      <UInput v-model="percentile" size="xl" />
      <div>% CERTAINTIES</div>
    </div>
    <div class="flex place-content-start place-items-center gap-6">
      <div class="flex place-content-start place-items-center gap-3">
        <UCheckbox v-model="onePull" class="h-8 w-8" />
        <div :class="{ 'text-gray-500 dark:text-gray-400': !onePull }">
          USING 1 PULL
        </div>
      </div>
      <div class="flex place-content-start place-items-center gap-3">
        <UCheckbox v-model="colorFes" class="h-8 w-8" />
        <div :class="{ 'text-gray-500 dark:text-gray-400': !colorFes }">
          IN COLORFES
        </div>
      </div>
    </div>
    <div
      class="flex place-content-start place-items-center gap-3 overflow-visible"
    >
      <div>YOU NEED</div>
      <div class="text-6xl">
        {{ percentileResult }}
      </div>
      <div>x {{ totalPerPull }} PULLS</div>
      <div class="text-base">
        (based on {{ simulationResultArray.length }} simulations)
      </div>
    </div>
    <div
      class="flex place-content-start place-items-center gap-3 overflow-visible"
    >
      <div class="text-base">
        (min possible: {{ minResult }}, max possible: {{ maxResult }})
      </div>
    </div>
    <div
      v-if="simulationRange"
      class="flex w-full px-10"
      @mouseleave="hoverIndex = undefined"
    >
      <TransitionGroup
        name="pull-graph"
        move-class="transition-transform duration-300 ease-in-out"
        enter-active-class="transition duration-300 ease-out"
        leave-active-class="w-0 transition duration-300 ease-out"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-for="({ start, end, count }, index) in graphResult"
          :key="index"
          class="flex flex-grow flex-col place-items-center gap-y-3"
        >
          <div class="flex h-72 w-full flex-col justify-end">
            <div
              v-if="graphResultModeValue"
              class="rounded-lg transition-all duration-300 ease-in-out"
              :class="{
                'bg-gray-500 dark:bg-gray-400':
                  index !== percentileIndex && index !== hoverIndex,
                'bg-red-500 dark:bg-red-400': index === hoverIndex,
                'bg-green-500 dark:bg-green-400': index === percentileIndex,
              }"
              :style="{
                height: `${(count / graphResultModeValue) * 100}%`,
              }"
              @mouseover="hoverIndex = index"
            ></div>
          </div>
          <div
            v-if="
              simulationRange.length < 8 ||
              index === 0 ||
              index === simulationRange.length - 1 ||
              index === (hoverIndex ?? percentileIndex)
            "
            class="flex w-0 flex-col place-content-center place-items-center overflow-visible"
          >
            <div class="text-nowrap">
              {{ start === end ? start : `${start} - ${end}` }}
            </div>
            <div class="text-nowrap">
              {{
                (
                  (sortedIndex(simulationResultArray, start) /
                    simulationResultArray.length) *
                  100
                ).toFixed(2)
              }}% -
              {{
                (
                  (sortedLastIndex(simulationResultArray, end) /
                    simulationResultArray.length) *
                  100
                ).toFixed(2)
              }}%
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
    <div
      class="flex place-content-start place-items-center gap-3 overflow-visible"
    >
      <div class="text-base">* assumption: all pulls are duped</div>
    </div>
  </UContainer>
</template>
