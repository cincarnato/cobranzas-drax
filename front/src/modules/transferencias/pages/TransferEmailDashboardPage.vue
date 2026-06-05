<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {IDraxFieldFilter} from "@drax/crud-share";
import {VDateInput} from "vuetify/labs/VDateInput";
import {useTheme} from "vuetify";
import TransferEmailProvider from "../providers/TransferEmailProvider";

type TransferDimension = "amount" | "month" | "needsHumanReview" | "destinationCbu"
type Accent = "amount" | "month" | "review" | "cbu"

type TransferGroupByRow = {
  transferDate?: unknown
  amount?: number | string | null
  month?: unknown
  needsHumanReview?: unknown
  destinationCbu?: unknown
  count?: number
}

type SummaryRow = {
  day: string
  label: string
  amount: number
  count: number
  percentage: number
}

type CardConfig = {
  title: string
  label: string
  dimension: TransferDimension
  icon: string
  accent: Accent
  showAmount: boolean
  rows: SummaryRow[]
}

const theme = useTheme();
const today = new Date(new Date().setHours(0, 0, 0, 0));
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const fromDate = ref<Date | null>(monthStart);
const toDate = ref<Date | null>(today);
const amountRows = ref<SummaryRow[]>([]);
const monthRows = ref<SummaryRow[]>([]);
const reviewRows = ref<SummaryRow[]>([]);
const cbuRows = ref<SummaryRow[]>([]);
const loading = ref(false);
const error = ref("");
let requestId = 0;

const isDarkTheme = computed(() => theme.current.value.dark);

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
    title: "Transferencias por día y monto",
    label: "Monto",
    dimension: "amount",
    icon: "mdi-cash-multiple",
    accent: "amount",
    showAmount: true,
    rows: amountRows.value,
  },
  {
    title: "Transferencias por día y mes",
    label: "Mes",
    dimension: "month",
    icon: "mdi-calendar-month-outline",
    accent: "month",
    showAmount: false,
    rows: monthRows.value,
  },
  {
    title: "Transferencias por día y revisión",
    label: "Revisión humana",
    dimension: "needsHumanReview",
    icon: "mdi-account-alert-outline",
    accent: "review",
    showAmount: false,
    rows: reviewRows.value,
  },
  {
    title: "Transferencias por día y CBU destino",
    label: "CBU destino",
    dimension: "destinationCbu",
    icon: "mdi-bank-outline",
    accent: "cbu",
    showAmount: false,
    rows: cbuRows.value,
  },
]);

function getStartOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getEndOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function buildFilters(): IDraxFieldFilter[] {
  const filters: IDraxFieldFilter[] = [];

  if (fromDate.value) {
    filters.push({field: "transferDate", operator: "gte", value: getStartOfDay(fromDate.value)});
  }

  if (toDate.value) {
    filters.push({field: "transferDate", operator: "lte", value: getEndOfDay(toDate.value)});
  }

  return filters;
}

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

function formatDay(value: unknown): string {
  if (!value) return "Sin fecha";

  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDisplayValue(value: unknown): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "Sin asignar";

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const displayValue = record.name ?? record.title ?? record.username ?? record.email ?? record._id;
    return displayValue ? String(displayValue) : "Sin asignar";
  }

  return String(value);
}

function toSummaryRows(rows: TransferGroupByRow[], dimension: TransferDimension): SummaryRow[] {
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

  return rows.map(row => {
    const count = Number(row.count ?? 0);
    const amount = parseAmount(row.amount);

    return {
      day: formatDay(row.transferDate),
      label: dimension === "amount" ? formatCurrency(amount) : getDisplayValue(row[dimension]),
      amount,
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

function getRowKey(row: SummaryRow): string {
  return `${row.day}-${row.label}`;
}

function clearDashboardRows() {
  amountRows.value = [];
  monthRows.value = [];
  reviewRows.value = [];
  cbuRows.value = [];
}

async function fetchDashboardData() {
  const currentRequestId = ++requestId;
  loading.value = true;
  error.value = "";

  try {
    const filters = buildFilters();
    const [amountData, monthData, reviewData, cbuData] = await Promise.all([
      TransferEmailProvider.instance.groupBy({fields: ["transferDate", "amount"], filters, dateFormat: "day"}),
      TransferEmailProvider.instance.groupBy({fields: ["transferDate", "month"], filters, dateFormat: "day"}),
      TransferEmailProvider.instance.groupBy({fields: ["transferDate", "needsHumanReview"], filters, dateFormat: "day"}),
      TransferEmailProvider.instance.groupBy({fields: ["transferDate", "destinationCbu"], filters, dateFormat: "day"}),
    ]);

    if (currentRequestId !== requestId) return;

    amountRows.value = toSummaryRows(amountData as TransferGroupByRow[], "amount");
    monthRows.value = toSummaryRows(monthData as TransferGroupByRow[], "month");
    reviewRows.value = toSummaryRows(reviewData as TransferGroupByRow[], "needsHumanReview");
    cbuRows.value = toSummaryRows(cbuData as TransferGroupByRow[], "destinationCbu");
  } catch (fetchError) {
    if (currentRequestId !== requestId) return;

    console.error("Error loading transfer email dashboard", fetchError);
    clearDashboardRows();
    error.value = "No se pudo cargar el dashboard de transferencias.";
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false;
    }
  }
}

function resetFilters() {
  fromDate.value = monthStart;
  toDate.value = today;
}

watch([fromDate, toDate], () => {
  fetchDashboardData();
}, {immediate: true});
</script>

<template>
  <v-container fluid>
    <div class="transfer-dashboard">
      <v-card class="transfer-dashboard__filters" variant="outlined">
        <v-card-item>
          <v-card-title>Dashboard de transferencias</v-card-title>
          <v-card-subtitle>
            Filtrá por fecha de transferencia y revisá las distribuciones diarias.
          </v-card-subtitle>
        </v-card-item>

        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="4" lg="3">
              <v-date-input
                v-model="fromDate"
                label="Transferencia desde"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4" lg="3">
              <v-date-input
                v-model="toDate"
                label="Transferencia hasta"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="auto" class="transfer-dashboard__actions">
              <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                variant="tonal"
                :loading="loading"
                :disabled="loading"
                @click="fetchDashboardData"
              >
                Actualizar
              </v-btn>
              <v-btn
                prepend-icon="mdi-filter-remove-outline"
                variant="text"
                :disabled="loading"
                @click="resetFilters"
              >
                Reiniciar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="error"
        class="my-4"
        type="error"
        variant="tonal"
        density="compact"
      >
        {{ error }}
      </v-alert>

      <v-row class="transfer-dashboard__cards mt-4">
        <v-col
          v-for="card in cards"
          :key="card.dimension"
          cols="12"
          md="6"
          class="d-flex"
        >
          <v-card
            class="transfer-dashboard__card"
            :class="[
              `transfer-dashboard__card--${card.accent}`,
              {'transfer-dashboard__card--dark': isDarkTheme},
            ]"
            variant="outlined"
          >
            <div class="transfer-dashboard__header">
              <div class="transfer-dashboard__heading">
                <div class="transfer-dashboard__icon">
                  <v-icon :icon="card.icon" />
                </div>
                <div>
                  <v-card-title class="transfer-dashboard__title">
                    {{ card.title }}
                  </v-card-title>
                  <div class="transfer-dashboard__subtitle">
                    {{ formatNumber(getTotalCount(card.rows)) }} transferencias registradas
                  </div>
                </div>
              </div>

              <div class="transfer-dashboard__metrics">
                <v-chip
                  v-if="card.showAmount"
                  class="transfer-dashboard__metric"
                  size="small"
                  variant="flat"
                >
                  {{ formatCurrency(getTotalAmount(card.rows)) }}
                </v-chip>
                <v-chip class="transfer-dashboard__metric" size="small" variant="tonal">
                  {{ card.rows.length }} filas
                </v-chip>
              </div>
            </div>

            <v-progress-linear
              v-if="loading"
              class="transfer-dashboard__loader"
              indeterminate
            />
            <v-progress-linear
              v-else
              class="transfer-dashboard__loader transfer-dashboard__loader--idle"
              model-value="100"
            />

            <v-table class="transfer-dashboard__table" density="compact" fixed-header>
              <thead>
                <tr>
                  <th class="text-left">Día</th>
                  <th class="text-left">{{ card.label }}</th>
                  <th v-if="card.showAmount" class="text-right">Monto</th>
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!loading && card.rows.length === 0">
                  <td
                    class="text-center text-medium-emphasis"
                    :colspan="card.showAmount ? 5 : 4"
                  >
                    No hay datos para los filtros seleccionados
                  </td>
                </tr>

                <tr v-for="row in card.rows" :key="getRowKey(row)">
                  <td class="transfer-dashboard__day">{{ row.day }}</td>
                  <td>
                    <div class="transfer-dashboard__label">
                      <span>{{ row.label }}</span>
                      <div class="transfer-dashboard__bar">
                        <div
                          class="transfer-dashboard__bar-value"
                          :style="{width: `${row.percentage}%`}"
                        />
                      </div>
                    </div>
                  </td>
                  <td v-if="card.showAmount" class="text-right transfer-dashboard__amount">
                    {{ formatCurrency(row.amount) }}
                  </td>
                  <td class="text-right">{{ formatNumber(row.count) }}</td>
                  <td class="text-right">
                    <v-chip class="transfer-dashboard__percentage" size="x-small" variant="tonal">
                      {{ formatPercentage(row.percentage) }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="transfer-dashboard__total">
                  <td><span class="transfer-dashboard__total-label">Total</span></td>
                  <td></td>
                  <td v-if="card.showAmount" class="text-right">
                    {{ formatCurrency(getTotalAmount(card.rows)) }}
                  </td>
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
.transfer-dashboard {
  width: 100%;
}

.transfer-dashboard__filters {
  border-color: rgba(var(--v-border-color), .42);
  border-radius: 8px;
}

.transfer-dashboard__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.transfer-dashboard__cards {
  align-items: stretch;
}

.transfer-dashboard__card {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
  --dashboard-accent-readable: var(--dashboard-accent-text);
  --dashboard-chip-bg: rgba(255, 255, 255, .78);
  --dashboard-header-sheen: rgba(255, 255, 255, .8);
  --dashboard-header-surface: rgba(255, 255, 255, .96);
  --dashboard-hover-bg: color-mix(in srgb, var(--dashboard-accent-soft) 42%, white);
  --dashboard-title-color: rgba(var(--v-theme-on-surface), .92);
  --dashboard-total-bg: color-mix(in srgb, var(--dashboard-accent-soft) 56%, white);
  border-color: rgba(var(--v-border-color), .42);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(30, 42, 55, .08);
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 420px;
  overflow: hidden;
}

.transfer-dashboard__card--amount {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
}

.transfer-dashboard__card--month {
  --dashboard-accent: #f57c00;
  --dashboard-accent-soft: #fff3e0;
  --dashboard-accent-text: #e65100;
}

.transfer-dashboard__card--review {
  --dashboard-accent: #d81b60;
  --dashboard-accent-soft: #fce4ec;
  --dashboard-accent-text: #ad1457;
}

.transfer-dashboard__card--cbu {
  --dashboard-accent: #1976d2;
  --dashboard-accent-soft: #e3f2fd;
  --dashboard-accent-text: #0d47a1;
}

.transfer-dashboard__card--dark {
  --dashboard-accent-readable: color-mix(in srgb, var(--dashboard-accent) 48%, #ffffff);
  --dashboard-accent-soft: color-mix(in srgb, var(--dashboard-accent) 18%, rgb(var(--v-theme-surface)));
  --dashboard-chip-bg: color-mix(in srgb, var(--dashboard-accent) 24%, rgba(0, 0, 0, .82));
  --dashboard-header-sheen: color-mix(in srgb, var(--dashboard-accent) 12%, transparent);
  --dashboard-header-surface: color-mix(in srgb, var(--dashboard-accent) 7%, rgb(var(--v-theme-surface)));
  --dashboard-hover-bg: color-mix(in srgb, var(--dashboard-accent) 14%, rgb(var(--v-theme-surface)));
  --dashboard-title-color: rgba(var(--v-theme-on-surface), .96);
  --dashboard-total-bg: color-mix(in srgb, var(--dashboard-accent) 18%, rgb(var(--v-theme-surface)));
  border-color: rgba(var(--v-border-color), .5);
  box-shadow: 0 14px 32px rgba(0, 0, 0, .28);
}

.transfer-dashboard__header {
  align-items: flex-start;
  background:
    linear-gradient(135deg, var(--dashboard-accent-soft), var(--dashboard-header-surface) 52%),
    linear-gradient(90deg, var(--dashboard-header-sheen), rgba(255, 255, 255, 0));
  border-bottom: 1px solid rgba(var(--v-border-color), .24);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px;
}

.transfer-dashboard__heading {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.transfer-dashboard__icon {
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

.transfer-dashboard__title {
  color: var(--dashboard-title-color);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  padding: 0;
}

.transfer-dashboard__subtitle {
  color: rgba(var(--v-theme-on-surface), .62);
  font-size: .78rem;
  line-height: 1.4;
  margin-top: 2px;
}

.transfer-dashboard__metrics {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.transfer-dashboard__metric {
  background: var(--dashboard-chip-bg);
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.transfer-dashboard__loader {
  color: var(--dashboard-accent);
}

.transfer-dashboard__loader--idle {
  opacity: .16;
}

.transfer-dashboard__table {
  flex: 1;
}

.transfer-dashboard__table :deep(table) {
  min-width: 580px;
}

.transfer-dashboard__table :deep(th),
.transfer-dashboard__table :deep(td) {
  white-space: nowrap;
}

.transfer-dashboard__table :deep(th) {
  background: rgba(var(--v-theme-surface), .96);
  color: rgba(var(--v-theme-on-surface), .66);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.transfer-dashboard__table :deep(tbody tr) {
  transition: background-color .16s ease, transform .16s ease;
}

.transfer-dashboard__table :deep(tbody tr:hover) {
  background: var(--dashboard-hover-bg);
}

.transfer-dashboard__table :deep(tfoot td) {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.transfer-dashboard__day {
  color: rgba(var(--v-theme-on-surface), .74);
  font-weight: 600;
}

.transfer-dashboard__label {
  display: grid;
  gap: 6px;
  min-width: 170px;
}

.transfer-dashboard__label span {
  font-weight: 600;
}

.transfer-dashboard__bar {
  background: rgba(var(--v-theme-on-surface), .08);
  border-radius: 999px;
  height: 5px;
  overflow: hidden;
  width: 100%;
}

.transfer-dashboard__bar-value {
  background: linear-gradient(90deg, var(--dashboard-accent), color-mix(in srgb, var(--dashboard-accent) 62%, white));
  border-radius: inherit;
  height: 100%;
  min-width: 4px;
}

.transfer-dashboard__amount,
.transfer-dashboard__percentage {
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.transfer-dashboard__total {
  background: var(--dashboard-total-bg);
  font-weight: 700;
}

.transfer-dashboard__total-label {
  color: var(--dashboard-accent-readable);
}

@media (max-width: 640px) {
  .transfer-dashboard__header {
    flex-direction: column;
  }

  .transfer-dashboard__metrics {
    align-items: flex-start;
  }
}
</style>
