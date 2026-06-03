<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {IDraxFieldFilter} from "@drax/crud-share";
import BonusProvider from "../providers/BonusProvider";

type BonusGroupByRow = {
  appliedMonth?: unknown
  plan?: unknown
  createdBy?: unknown
  period?: unknown
  bonifiedNetValue?: number | string | null
  count?: number
}

type SummaryRow = {
  label: string
  amount: number
  count: number
  percentage: number
}

type CardConfig = {
  title: string
  label: string
  dimension: "appliedMonth" | "plan" | "createdBy" | "period"
  icon: string
  accent: "month" | "plan" | "created-by" | "period"
  rows: SummaryRow[]
}

const props = defineProps<{
  filters?: IDraxFieldFilter[]
}>();

const emit = defineEmits<{
  (event: "loading-change", value: boolean): void
}>();

const monthRows = ref<SummaryRow[]>([]);
const planRows = ref<SummaryRow[]>([]);
const createdByRows = ref<SummaryRow[]>([]);
const periodRows = ref<SummaryRow[]>([]);
const loading = ref(false);
const error = ref("");
let requestId = 0;

const numberFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const cards = computed<CardConfig[]>(() => [
  {
    title: "Bonificaciones por mes",
    label: "Mes aplicado",
    dimension: "appliedMonth",
    icon: "mdi-calendar-month-outline",
    accent: "month",
    rows: monthRows.value,
  },
  {
    title: "Bonificaciones por plan",
    label: "Plan",
    dimension: "plan",
    icon: "mdi-clipboard-list-outline",
    accent: "plan",
    rows: planRows.value,
  },
  {
    title: "Bonificaciones por usuario",
    label: "Usuario",
    dimension: "createdBy",
    icon: "mdi-account-cash-outline",
    accent: "created-by",
    rows: createdByRows.value,
  },
  {
    title: "Bonificaciones por periodo",
    label: "Periodo",
    dimension: "period",
    icon: "mdi-timer-sand",
    accent: "period",
    rows: periodRows.value,
  },
]);

function parseAmount(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const normalizedValue = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatPercentage(value: number): string {
  return `${value.toLocaleString("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function getDisplayValue(value: unknown): string {
  if (!value) return "Sin asignar";

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const displayValue = record.name ?? record.username ?? record.fullname ?? record.email ?? record._id;
    return displayValue ? String(displayValue) : "Sin asignar";
  }

  return String(value);
}

function toSummaryRows(
  rows: BonusGroupByRow[],
  dimension: CardConfig["dimension"],
): SummaryRow[] {
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

  return rows.map(row => {
    const count = Number(row.count ?? 0);

    return {
      label: getDisplayValue(row[dimension]),
      amount: parseAmount(row.bonifiedNetValue),
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    };
  });
}

function getTotalAmount(rows: SummaryRow[]): number {
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

function getTotalCount(rows: SummaryRow[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}

function clearDashboardRows() {
  monthRows.value = [];
  planRows.value = [];
  createdByRows.value = [];
  periodRows.value = [];
}

async function fetchDashboardData() {
  const currentRequestId = ++requestId;
  loading.value = true;
  emit("loading-change", true);
  error.value = "";

  try {
    const filters = props.filters ?? [];
    const [monthData, planData, createdByData, periodData] = await Promise.all([
      BonusProvider.instance.groupBy({
        fields: ["appliedMonth", "bonifiedNetValue"],
        filters,
      }),
      BonusProvider.instance.groupBy({
        fields: ["plan", "bonifiedNetValue"],
        filters,
      }),
      BonusProvider.instance.groupBy({
        fields: ["createdBy", "bonifiedNetValue"],
        filters,
      }),
      BonusProvider.instance.groupBy({
        fields: ["period", "bonifiedNetValue"],
        filters,
      }),
    ]);

    if (currentRequestId !== requestId) return;

    monthRows.value = toSummaryRows(monthData as BonusGroupByRow[], "appliedMonth");
    planRows.value = toSummaryRows(planData as BonusGroupByRow[], "plan");
    createdByRows.value = toSummaryRows(createdByData as BonusGroupByRow[], "createdBy");
    periodRows.value = toSummaryRows(periodData as BonusGroupByRow[], "period");
  } catch (fetchError) {
    if (currentRequestId !== requestId) return;

    console.error("Error loading bonus dashboard", fetchError);
    clearDashboardRows();
    error.value = "No se pudo cargar el resumen de bonificaciones.";
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false;
      emit("loading-change", false);
    }
  }
}

watch(
  () => props.filters,
  () => {
    fetchDashboardData();
  },
  {deep: true, immediate: true},
);

defineExpose({
  refresh: fetchDashboardData,
});
</script>

<template>
  <v-container fluid >
  <div class="bonus-dashboard">
    <v-alert
      v-if="error"
      class="mb-4"
      type="error"
      variant="tonal"
      density="compact"
    >
      {{ error }}
    </v-alert>

    <v-row class="bonus-dashboard__cards">
      <v-col
        v-for="card in cards"
        :key="card.dimension"
        cols="12"
        md="6"
        class="d-flex"
      >
        <v-card
          class="bonus-dashboard__card"
          :class="`bonus-dashboard__card--${card.accent}`"
          variant="outlined"
        >
          <div class="bonus-dashboard__header">
            <div class="bonus-dashboard__heading">
              <div class="bonus-dashboard__icon">
                <v-icon :icon="card.icon" />
              </div>
              <div>
                <v-card-title class="bonus-dashboard__title">
                  {{ card.title }}
                </v-card-title>
                <div class="bonus-dashboard__subtitle">
                  {{ formatNumber(getTotalCount(card.rows)) }} bonificaciones registradas
                </div>
              </div>
            </div>

            <div class="bonus-dashboard__metrics">
              <v-chip
                class="bonus-dashboard__metric"
                size="small"
                variant="flat"
              >
                {{ formatCurrency(getTotalAmount(card.rows)) }}
              </v-chip>
              <v-chip
                class="bonus-dashboard__metric"
                size="small"
                variant="tonal"
              >
                {{ card.rows.length }} filas
              </v-chip>
            </div>
          </div>

          <v-progress-linear
            v-if="loading"
            class="bonus-dashboard__loader"
            indeterminate
          />
          <v-progress-linear
            v-else
            class="bonus-dashboard__loader bonus-dashboard__loader--idle"
            model-value="100"
          />

          <v-table
            class="bonus-dashboard__table"
            density="compact"
            fixed-header
          >
            <thead>
              <tr>
                <th class="text-left">{{ card.label }}</th>
                <th class="text-right">Monto</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && card.rows.length === 0">
                <td
                  class="text-center text-medium-emphasis"
                  colspan="4"
                >
                  No hay datos para los filtros seleccionados
                </td>
              </tr>

              <tr
                v-for="row in card.rows"
                :key="row.label"
              >
                <td>
                  <div class="bonus-dashboard__label">
                    <span>{{ row.label }}</span>
                    <div class="bonus-dashboard__bar">
                      <div
                        class="bonus-dashboard__bar-value"
                        :style="{width: `${row.percentage}%`}"
                      />
                    </div>
                  </div>
                </td>
                <td class="text-right bonus-dashboard__amount">
                  {{ formatCurrency(row.amount) }}
                </td>
                <td class="text-right">{{ formatNumber(row.count) }}</td>
                <td class="text-right">
                  <v-chip
                    class="bonus-dashboard__percentage"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ formatPercentage(row.percentage) }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bonus-dashboard__total">
                <td>
                  <span class="bonus-dashboard__total-label">Total</span>
                </td>
                <td class="text-right">{{ formatCurrency(getTotalAmount(card.rows)) }}</td>
                <td class="text-right">{{ formatNumber(getTotalCount(card.rows)) }}</td>
                <td class="text-right">{{ card.rows.length ? "100,0%" : "0,0%" }}</td>
              </tr>
            </tfoot>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
  </v-container>
</template>

<style scoped>
.bonus-dashboard {
  width: 100%;
}

.bonus-dashboard__cards {
  align-items: stretch;
}

.bonus-dashboard__card {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
  border-color: rgba(var(--v-border-color), .42);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(30, 42, 55, .08);
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 420px;
  overflow: hidden;
}

.bonus-dashboard__card--month {
  --dashboard-accent: #f57c00;
  --dashboard-accent-soft: #fff3e0;
  --dashboard-accent-text: #e65100;
}

.bonus-dashboard__card--plan {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
}

.bonus-dashboard__card--created-by {
  --dashboard-accent: #1976d2;
  --dashboard-accent-soft: #e3f2fd;
  --dashboard-accent-text: #0d47a1;
}

.bonus-dashboard__card--period {
  --dashboard-accent: #6d4c41;
  --dashboard-accent-soft: #efebe9;
  --dashboard-accent-text: #4e342e;
}

.bonus-dashboard__header {
  align-items: flex-start;
  background:
    linear-gradient(135deg, var(--dashboard-accent-soft), rgba(255, 255, 255, .96) 52%),
    linear-gradient(90deg, rgba(255, 255, 255, .8), rgba(255, 255, 255, 0));
  border-bottom: 1px solid rgba(var(--v-border-color), .24);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px;
}

.bonus-dashboard__heading {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.bonus-dashboard__icon {
  align-items: center;
  background: var(--dashboard-accent);
  border-radius: 8px;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--dashboard-accent) 28%, transparent);
  color: #fff;
  display: flex;
  flex: 0 0 42px;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.bonus-dashboard__title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  padding: 0;
}

.bonus-dashboard__subtitle {
  color: rgba(var(--v-theme-on-surface), .62);
  font-size: .78rem;
  line-height: 1.4;
  margin-top: 2px;
}

.bonus-dashboard__metrics {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bonus-dashboard__metric {
  background: rgba(255, 255, 255, .78);
  color: var(--dashboard-accent-text);
  font-weight: 700;
}

.bonus-dashboard__loader {
  color: var(--dashboard-accent);
}

.bonus-dashboard__loader--idle {
  opacity: .16;
}

.bonus-dashboard__table {
  flex: 1;
}

.bonus-dashboard__table :deep(table) {
  min-width: 520px;
}

.bonus-dashboard__table :deep(th),
.bonus-dashboard__table :deep(td) {
  white-space: nowrap;
}

.bonus-dashboard__table :deep(th) {
  background: rgba(var(--v-theme-surface), .96);
  color: rgba(var(--v-theme-on-surface), .66);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.bonus-dashboard__table :deep(tbody tr) {
  transition: background-color .16s ease, transform .16s ease;
}

.bonus-dashboard__table :deep(tbody tr:hover) {
  background: color-mix(in srgb, var(--dashboard-accent-soft) 42%, white);
}

.bonus-dashboard__table :deep(tfoot td) {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.bonus-dashboard__label {
  display: grid;
  gap: 6px;
  min-width: 170px;
}

.bonus-dashboard__label span {
  font-weight: 600;
}

.bonus-dashboard__bar {
  background: rgba(var(--v-theme-on-surface), .08);
  border-radius: 999px;
  height: 5px;
  overflow: hidden;
  width: 100%;
}

.bonus-dashboard__bar-value {
  background: linear-gradient(90deg, var(--dashboard-accent), color-mix(in srgb, var(--dashboard-accent) 62%, white));
  border-radius: inherit;
  height: 100%;
  min-width: 4px;
}

.bonus-dashboard__amount {
  color: var(--dashboard-accent-text);
  font-weight: 700;
}

.bonus-dashboard__percentage {
  color: var(--dashboard-accent-text);
  font-weight: 700;
}

.bonus-dashboard__total {
  background: color-mix(in srgb, var(--dashboard-accent-soft) 56%, white);
  font-weight: 700;
}

.bonus-dashboard__total-label {
  color: var(--dashboard-accent-text);
}

@media (max-width: 640px) {
  .bonus-dashboard__header {
    flex-direction: column;
  }

  .bonus-dashboard__metrics {
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
