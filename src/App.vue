<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import metricsData from './data/metrics.json'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
)

type MetricKey = 'sales' | 'transactions' | 'footTraffic' | 'conversionRate' | 'unitsSold'
type MonthRecord = (typeof metricsData.months)[number]

const allCategories = metricsData.categories.map((category) => category.name)
const categoryColors = Object.fromEntries(
  metricsData.categories.map((category) => [category.name, category.color]),
) as Record<string, string>

const metricConfig = {
  sales: {
    label: 'Sales',
    format: (value: number) => `$${value.toLocaleString()}`,
  },
  transactions: {
    label: 'Transactions',
    format: (value: number) => `${value.toLocaleString()}`,
  },
  footTraffic: {
    label: 'Foot Traffic',
    format: (value: number) => `${value.toLocaleString()}`,
  },
  conversionRate: {
    label: 'Conversion Rate',
    format: (value: number) => `${value.toFixed(1)}%`,
  },
  unitsSold: {
    label: 'Units Sold',
    format: (value: number) => `${value.toLocaleString()}`,
  },
} as const

const categorySelection = ref<string[]>([...allCategories])
const selectedMetric = ref<MetricKey>('sales')
const activeMonth = ref<string>(metricsData.months[metricsData.months.length - 1].month)

const monthMap = new Map(metricsData.months.map((month) => [month.month, month]))
const selectedMonthData = computed(
  () => monthMap.get(activeMonth.value) ?? metricsData.months[0],
)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const formatPercent = (value: number) => `${value.toFixed(1)}%`

const categoryTotals = computed(() =>
  metricsData.categories
    .map((category) => {
      const totalSales = metricsData.months.reduce((sum, month) => {
        const match = month.categories.find((item) => item.category === category.name)
        return sum + (match?.sales ?? 0)
      }, 0)

      return {
        ...category,
        totalSales,
      }
    })
    .sort((a, b) => b.totalSales - a.totalSales),
)

const annualSales = computed(() =>
  metricsData.months.reduce((sum, month) => sum + month.sales, 0),
)
const annualTransactions = computed(() =>
  metricsData.months.reduce((sum, month) => sum + month.transactions, 0),
)
const annualUnits = computed(() =>
  metricsData.months.reduce((sum, month) => sum + month.unitsSold, 0),
)

const topCategory = computed(() => categoryTotals.value[0])
const peakMonth = computed(() =>
  [...metricsData.months].sort((a, b) => b.sales - a.sales)[0],
)
const lowMonth = computed(() =>
  [...metricsData.months].sort((a, b) => a.sales - b.sales)[0],
)

const updateCategorySelection = (nextValues: string[]) => {
  if (nextValues.length === 0) {
    categorySelection.value = [...allCategories]
    return
  }

  categorySelection.value = nextValues
}

const getMetricValue = (month: MonthRecord, key: MetricKey) => {
  if (key === 'sales') {
    return month.categories
      .filter((item) => categorySelection.value.includes(item.category))
      .reduce((sum, item) => sum + item.sales, 0)
  }

  if (key === 'transactions') {
    return month.transactions
  }

  if (key === 'footTraffic') {
    return month.footTraffic
  }

  if (key === 'conversionRate') {
    return month.conversionRate * 100
  }

  return month.categories
    .filter((item) => categorySelection.value.includes(item.category))
    .reduce((sum, item) => sum + item.unitsSold, 0)
}

const lineChartValues = computed(() =>
  metricsData.months.map((month) => getMetricValue(month, selectedMetric.value)),
)

const monthlyTrendChartData = computed(() => ({
  labels: metricsData.months.map((month) => month.month.replace('-', '/')),
  datasets: [
    {
      label: metricConfig[selectedMetric.value].label,
      data: lineChartValues.value,
      fill: true,
      backgroundColor: 'rgba(125, 165, 255, 0.18)',
      borderColor: '#8db9ff',
      borderWidth: 3,
      pointRadius: metricsData.months.map((month) =>
        month.month === activeMonth.value ? 5 : 3,
      ),
      pointHoverRadius: 6,
      pointBackgroundColor: metricsData.months.map((month) =>
        month.month === activeMonth.value ? '#f3c969' : '#dfeaff',
      ),
      pointBorderColor: '#8db9ff',
      tension: 0.35,
    },
  ],
}))

const categoryBreakdown = computed(() =>
  selectedMonthData.value.categories
    .filter((item) => categorySelection.value.includes(item.category))
    .sort((a, b) => b.sales - a.sales),
)

const categoryChartData = computed(() => ({
  labels: categoryBreakdown.value.map((item) => item.category),
  datasets: [
    {
      label: 'Sales',
      data: categoryBreakdown.value.map((item) => item.sales),
      backgroundColor: categoryBreakdown.value.map(
        (item) => categoryColors[item.category] ?? '#8db9ff',
      ),
      borderRadius: 10,
    },
  ],
}))

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  onClick: (_event: unknown, elements: Array<{ index: number }>) => {
    if (!elements.length) return

    const selectedIndex = elements[0].index
    activeMonth.value = metricsData.months[selectedIndex]?.month
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number } }) => {
          const value = context.parsed.y
          const key = selectedMetric.value

          if (key === 'conversionRate') {
            return `${metricConfig[key].label}: ${metricConfig[key].format(value)}`
          }

          return `${metricConfig[key].label}: ${metricConfig[key].format(value)}`
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#dfe7f8',
        maxRotation: 0,
      },
      grid: {
        color: 'rgba(255,255,255,0.05)',
      },
    },
    y: {
      ticks: {
        color: '#dfe7f8',
        callback: (value: string | number) => {
          const val = Number(value)
          if (selectedMetric.value === 'conversionRate') {
            return `${val.toFixed(0)}%`
          }

          if (selectedMetric.value === 'sales') {
            return `$${(val / 1000).toFixed(0)}k`
          }

          return `${Math.round(val)}`
        },
      },
      grid: {
        color: 'rgba(255,255,255,0.05)',
      },
    },
  },
}))

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number } }) =>
          `Sales: ${formatCurrency(context.parsed.y)}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#dfe7f8',
      },
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        color: '#dfe7f8',
        callback: (value: string | number) => `$${Number(value) / 1000}k`,
      },
      grid: {
        color: 'rgba(255,255,255,0.05)',
      },
    },
  },
}))

const metricSummary = computed(() => [
  {
    label: 'Annual sales',
    value: formatCurrency(annualSales.value),
    accent: 'text-primary',
  },
  {
    label: 'Transactions',
    value: annualTransactions.value.toLocaleString(),
    accent: 'text-secondary',
  },
  {
    label: 'Avg. conv.',
    value: formatPercent(
      metricsData.months.reduce((sum, month) => sum + month.conversionRate, 0) /
        metricsData.months.length *
        100,
    ),
    accent: 'text-accent',
  },
  {
    label: 'Units sold',
    value: annualUnits.value.toLocaleString(),
    accent: 'text-green-lighten-2',
  },
])

const selectedMonthNarrative = computed(() => {
  const monthName = selectedMonthData.value.month
  const monthSales = selectedMonthData.value.sales
  const monthTransactions = selectedMonthData.value.transactions
  const monthConversion = selectedMonthData.value.conversionRate * 100

  return {
    title: `${monthName}: key moment`,
    body: `${formatCurrency(monthSales)} in sales with ${monthTransactions.toLocaleString()} transactions and ${formatPercent(monthConversion)} conversion — a strong example of the holiday lift.`,
  }
})

const categoryNarrative = computed(() => {
  const top = topCategory.value
  const share = (top.totalSales / annualSales.value) * 100

  return `${top.name} leads the mix with ${formatCurrency(top.totalSales)} in sales, contributing ${share.toFixed(1)}% of total revenue.`
})

const seasonalNarrative = computed(() => {
  const peak = peakMonth.value
  const trough = lowMonth.value

  return `Sales rise into a year-end peak in ${peak.month} (${formatCurrency(peak.sales)}) and soften to ${formatCurrency(trough.sales)} in ${trough.month}, showing a repeatable holiday pattern.`
})
</script>

<template>
  <v-app theme="dark">
    <v-main class="bg-background">
      <v-container class="py-8 px-4 px-md-8" max-width="1400">
        <section class="mb-8">
          <v-row align="center" justify="space-between">
            <v-col cols="12" md="7">
              <div class="text-overline text-primary font-weight-bold mb-2">
                Seasonal sales story
              </div>
              <h1 class="text-h3 text-md-h2 font-weight-bold mb-3">
                The pet store’s demand curve is anchored in holiday demand.
              </h1>
              <p class="text-body-1 text-medium-emphasis mb-0 max-width-680">
                Across both 2024 and 2025, sales rise sharply from late summer,
                peak in the holiday window, and ease back to winter baselines. The
                story is mostly driven by food, treats, and enrichment products.
              </p>
            </v-col>

            <v-col cols="12" md="5">
              <v-card class="pa-5 rounded-xl border-surface" color="surface">
                <div class="d-flex justify-space-between align-center mb-4">
                  <div>
                    <div class="text-overline text-grey-lighten-1">Peak month</div>
                    <div class="text-h5 font-weight-bold">{{ peakMonth.month }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-caption text-grey-lighten-1">Revenue</div>
                    <div class="text-h6 text-primary">{{ formatCurrency(peakMonth.sales) }}</div>
                  </div>
                </div>

                <v-divider class="my-3" />

                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-overline text-grey-lighten-1">Lowest month</div>
                    <div class="text-body-1">{{ lowMonth.month }}</div>
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ formatCurrency(lowMonth.sales) }}
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </section>

        <section class="mb-8">
          <v-row>
            <v-col v-for="item in metricSummary" :key="item.label" cols="12" sm="6" md="3">
              <v-card class="pa-4 rounded-xl border-surface" color="surface" flat>
                <div class="text-overline text-grey-lighten-1">{{ item.label }}</div>
                <div class="text-h5 font-weight-bold" :class="item.accent">
                  {{ item.value }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </section>

        <section class="mb-8">
          <v-card class="pa-4 pa-md-6 rounded-xl border-surface" color="surface">
            <div class="d-flex flex-column flex-md-row justify-space-between align-md-center mb-4">
              <div>
                <div class="text-overline text-primary">Narrative metric</div>
                <h2 class="text-h5 font-weight-bold mb-0">
                  {{ metricConfig[selectedMetric].label }} trend
                </h2>
              </div>

              <v-btn-toggle
                v-model="selectedMetric"
                color="primary"
                divided
                variant="outlined"
                density="comfortable"
                mandatory
              >
                <v-btn value="sales">Sales</v-btn>
                <v-btn value="footTraffic">Foot traffic</v-btn>
                <v-btn value="transactions">Transactions</v-btn>
                <v-btn value="conversionRate">Conversion</v-btn>
                <v-btn value="unitsSold">Units</v-btn>
              </v-btn-toggle>
            </div>

            <div class="chart-frame">
              <Line :data="monthlyTrendChartData" :options="lineChartOptions" />
            </div>
          </v-card>
        </section>

        <section class="mb-8">
          <v-row>
            <v-col cols="12" lg="7">
              <v-card class="pa-4 pa-md-6 rounded-xl border-surface" color="surface">
                <div class="text-overline text-primary mb-2">Category selection</div>
                <h2 class="text-h5 font-weight-bold mb-3">What is driving the seasonal lift?</h2>

                <v-chip-group
                  v-model="categorySelection"
                  color="primary"
                  multiple
                  selected-class="text-white"
                  @update:model-value="updateCategorySelection"
                >
                  <v-chip
                    v-for="category in allCategories"
                    :key="category"
                    :value="category"
                    filter
                    variant="outlined"
                    :style="{ borderColor: `${categoryColors[category]}80` }"
                  >
                    {{ category }}
                  </v-chip>
                </v-chip-group>

                <v-alert class="mt-4" color="primary" variant="tonal" border="start">
                  {{ categoryNarrative }}
                </v-alert>

                <div class="chart-frame mt-4">
                  <Bar :data="categoryChartData" :options="barChartOptions" />
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" lg="5">
              <v-card class="pa-4 pa-md-6 rounded-xl border-surface" color="surface">
                <div class="text-overline text-primary mb-2">Current focus</div>
                <h2 class="text-h5 font-weight-bold mb-4">{{ selectedMonthNarrative.title }}</h2>

                <p class="text-body-1 text-medium-emphasis mb-5">
                  {{ selectedMonthNarrative.body }}
                </p>

                <v-list bg-color="transparent" density="comfortable">
                  <v-list-item class="px-0 mb-1">
                    <template #prepend>
                      <v-icon color="primary">mdi-trending-up</v-icon>
                    </template>
                    <v-list-item-title>{{ seasonalNarrative }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0 mb-1">
                    <template #prepend>
                      <v-icon color="secondary">mdi-package-variant</v-icon>
                    </template>
                    <v-list-item-title>
                      Selected month sales: {{ formatCurrency(selectedMonthData.sales) }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon color="accent">mdi-chart-box-outline</v-icon>
                    </template>
                    <v-list-item-title>
                      Selected categories: {{ categorySelection.length }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </section>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
:deep(.v-application) {
  background: #101725;
}

.border-surface {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.max-width-680 {
  max-width: 680px;
}

.chart-frame {
  position: relative;
  height: 360px;
  width: 100%;
}
</style>
