<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {IDraxFieldFilter} from "@drax/crud-share";
import {VDateInput} from "vuetify/labs/VDateInput";
import {useTheme} from "vuetify";
import InternalTransferBonusProvider from "../providers/InternalTransferBonusProvider";

type DashboardGroupByRow = {
  appliedMonth?: unknown
  bonusType?: unknown
  createdBy?: unknown
  status?: unknown
  bonifiedValue?: number | string | null
  count?: number
}

type SummaryRow = {
  label: string
  amount: number
  count: number
  percentage: number
}

type CardConfig = {
  key: string
  title: string
  label: string
  dimension: "appliedMonth" | "bonusType" | "createdBy" | "status"
  icon: string
  accent: "month" | "type" | "created-by" | "status" | "status-amount"
  showAmount: boolean
  rows: SummaryRow[]
}

const props = defineProps<{
  filters?: IDraxFieldFilter[]
}>();

const emit = defineEmits<{
  (event: "loading-change", value: boolean): void
}>();

const theme = useTheme();
const today = new Date(new Date().setHours(0, 0, 0, 0));
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const fromDate = ref<Date | null>(monthStart);
const toDate = ref<Date | null>(today);
const appliedMonth = ref<string | null>(null);
const monthRows = ref<SummaryRow[]>([]);
const typeRows = ref<SummaryRow[]>([]);
const createdByRows = ref<SummaryRow[]>([]);
const statusRows = ref<SummaryRow[]>([]);
const statusAmountRows = ref<SummaryRow[]>([]);
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

const appliedMonthOptions = [
  {title: "Enero", value: "Enero"},
  {title: "Febrero", value: "Febrero"},
  {title: "Marzo", value: "Marzo"},
  {title: "Abril", value: "Abril"},
  {title: "Mayo", value: "Mayo"},
  {title: "Junio", value: "Junio"},
  {title: "Julio", value: "Julio"},
  {title: "Agosto", value: "Agosto"},
  {title: "Septiembre", value: "Septiembre"},
  {title: "Octubre", value: "Octubre"},
  {title: "Noviembre", value: "Noviembre"},
  {title: "Diciembre", value: "Diciembre"},
];

const cards = computed<CardConfig[]>(() => [
  {
    key: "appliedMonth",
    title: "Bonificaciones TPI por mes",
    label: "Mes aplicado",
    dimension: "appliedMonth",
    icon: "mdi-calendar-month-outline",
    accent: "month",
    showAmount: true,
    rows: monthRows.value,
  },
  {
    key: "bonusType",
    title: "Bonificaciones TPI por tipo",
    label: "Tipo",
    dimension: "bonusType",
    icon: "mdi-bank-transfer",
    accent: "type",
    showAmount: true,
    rows: typeRows.value,
  },
  {
    key: "createdBy",
    title: "Bonificaciones TPI por usuario",
    label: "Usuario",
    dimension: "createdBy",
    icon: "mdi-account-cash-outline",
    accent: "created-by",
    showAmount: true,
    rows: createdByRows.value,
  },
  {
    key: "status",
    title: "Bonificaciones TPI por estado",
    label: "Estado",
    dimension: "status",
    icon: "mdi-list-status",
    accent: "status",
    showAmount: false,
    rows: statusRows.value,
  },
  {
    key: "statusAmount",
    title: "Bonificaciones TPI por estado y monto",
    label: "Estado",
    dimension: "status",
    icon: "mdi-cash-multiple",
    accent: "status-amount",
    showAmount: true,
    rows: statusAmountRows.value,
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
  const filters: IDraxFieldFilter[] = [...(props.filters ?? [])];

  if (fromDate.value) {
    filters.push({field: "createdAt", operator: "gte", value: getStartOfDay(fromDate.value)});
  }

  if (toDate.value) {
    filters.push({field: "createdAt", operator: "lte", value: getEndOfDay(toDate.value)});
  }

  if (appliedMonth.value) {
    filters.push({field: "appliedMonth", operator: "eq", value: appliedMonth.value});
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
  rows: DashboardGroupByRow[],
  dimension: CardConfig["dimension"],
): SummaryRow[] {
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

  return rows.map(row => {
    const count = Number(row.count ?? 0);

    return {
      label: getDisplayValue(row[dimension]),
      amount: parseAmount(row.bonifiedValue),
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
  typeRows.value = [];
  createdByRows.value = [];
  statusRows.value = [];
  statusAmountRows.value = [];
}

async function fetchDashboardData() {
  const currentRequestId = ++requestId;
  loading.value = true;
  emit("loading-change", true);
  error.value = "";

  try {
    const filters = buildFilters();
    const [monthData, typeData, createdByData, statusData, statusAmountData] = await Promise.all([
      InternalTransferBonusProvider.instance.groupBy({fields: ["appliedMonth", "bonifiedValue"], filters}),
      InternalTransferBonusProvider.instance.groupBy({fields: ["bonusType", "bonifiedValue"], filters}),
      InternalTransferBonusProvider.instance.groupBy({fields: ["createdBy", "bonifiedValue"], filters}),
      InternalTransferBonusProvider.instance.groupBy({fields: ["status"], filters}),
      InternalTransferBonusProvider.instance.groupBy({fields: ["status", "bonifiedValue"], filters}),
    ]);

    if (currentRequestId !== requestId) return;

    monthRows.value = toSummaryRows(monthData as DashboardGroupByRow[], "appliedMonth");
    typeRows.value = toSummaryRows(typeData as DashboardGroupByRow[], "bonusType");
    createdByRows.value = toSummaryRows(createdByData as DashboardGroupByRow[], "createdBy");
    statusRows.value = toSummaryRows(statusData as DashboardGroupByRow[], "status");
    statusAmountRows.value = toSummaryRows(statusAmountData as DashboardGroupByRow[], "status");
  } catch (fetchError) {
    if (currentRequestId !== requestId) return;

    console.error("Error loading internal transfer bonus dashboard", fetchError);
    clearDashboardRows();
    error.value = "No se pudo cargar el resumen de bonificaciones TPI.";
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false;
      emit("loading-change", false);
    }
  }
}

function resetFilters() {
  fromDate.value = monthStart;
  toDate.value = today;
  appliedMonth.value = null;
}

watch(
  [fromDate, toDate, appliedMonth, () => props.filters],
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
  <v-container fluid>
    <div class="tpi-dashboard">
      <v-card class="tpi-dashboard__filters" variant="outlined">
        <v-card-item>
          <v-card-title>Dashboard de bonificaciones TPI</v-card-title>
          <v-card-subtitle>
            Filtrá por fecha de carga y, opcionalmente, por mes aplicado.
          </v-card-subtitle>
        </v-card-item>

        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="4" lg="3">
              <v-date-input
                v-model="fromDate"
                label="Carga desde"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4" lg="3">
              <v-date-input
                v-model="toDate"
                label="Carga hasta"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4" lg="3">
              <v-select
                v-model="appliedMonth"
                :items="appliedMonthOptions"
                label="Mes aplicado"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="auto" class="tpi-dashboard__actions">
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

      <v-row class="tpi-dashboard__cards mt-4">
        <v-col
          v-for="card in cards"
          :key="card.key"
          cols="12"
          md="6"
          class="d-flex"
        >
          <v-card
            class="tpi-dashboard__card"
            :class="[
              `tpi-dashboard__card--${card.accent}`,
              {'tpi-dashboard__card--dark': isDarkTheme},
            ]"
            variant="outlined"
          >
            <div class="tpi-dashboard__header">
              <div class="tpi-dashboard__heading">
                <div class="tpi-dashboard__icon">
                  <v-icon :icon="card.icon" />
                </div>
                <div>
                  <v-card-title class="tpi-dashboard__title">
                    {{ card.title }}
                  </v-card-title>
                  <div class="tpi-dashboard__subtitle">
                    {{ formatNumber(getTotalCount(card.rows)) }} bonificaciones registradas
                  </div>
                </div>
              </div>

              <div class="tpi-dashboard__metrics">
                <v-chip class="tpi-dashboard__metric" size="small" variant="flat">
                  {{ card.showAmount ? formatCurrency(getTotalAmount(card.rows)) : `${formatNumber(getTotalCount(card.rows))} casos` }}
                </v-chip>
                <v-chip class="tpi-dashboard__metric" size="small" variant="tonal">
                  {{ card.rows.length }} filas
                </v-chip>
              </div>
            </div>

            <v-progress-linear
              v-if="loading"
              class="tpi-dashboard__loader"
              indeterminate
            />
            <v-progress-linear
              v-else
              class="tpi-dashboard__loader tpi-dashboard__loader--idle"
              model-value="100"
            />

            <v-table class="tpi-dashboard__table" density="compact" fixed-header>
              <thead>
                <tr>
                  <th class="text-left">{{ card.label }}</th>
                  <th v-if="card.showAmount" class="text-right">Monto</th>
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!loading && card.rows.length === 0">
                  <td class="text-center text-medium-emphasis" :colspan="card.showAmount ? 4 : 3">
                    No hay datos para los filtros seleccionados
                  </td>
                </tr>

                <tr v-for="row in card.rows" :key="row.label">
                  <td>
                    <div class="tpi-dashboard__label">
                      <span>{{ row.label }}</span>
                      <div class="tpi-dashboard__bar">
                        <div class="tpi-dashboard__bar-value" :style="{width: `${row.percentage}%`}" />
                      </div>
                    </div>
                  </td>
                  <td v-if="card.showAmount" class="text-right tpi-dashboard__amount">
                    {{ formatCurrency(row.amount) }}
                  </td>
                  <td class="text-right">{{ formatNumber(row.count) }}</td>
                  <td class="text-right">
                    <v-chip class="tpi-dashboard__percentage" size="x-small" variant="tonal">
                      {{ formatPercentage(row.percentage) }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="tpi-dashboard__total">
                  <td><span class="tpi-dashboard__total-label">Total</span></td>
                  <td v-if="card.showAmount" class="text-right">{{ formatCurrency(getTotalAmount(card.rows)) }}</td>
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
.tpi-dashboard {
  width: 100%;
}

.tpi-dashboard__filters {
  border-color: rgba(var(--v-border-color), .42);
  border-radius: 8px;
}

.tpi-dashboard__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tpi-dashboard__cards {
  align-items: stretch;
}

.tpi-dashboard__card {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
  --dashboard-accent-readable: var(--dashboard-accent-text);
  --dashboard-chip-bg: rgba(255, 255, 255, .78);
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

.tpi-dashboard__card--month {
  --dashboard-accent: #f57c00;
  --dashboard-accent-soft: #fff3e0;
  --dashboard-accent-text: #e65100;
}

.tpi-dashboard__card--type {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
}

.tpi-dashboard__card--created-by {
  --dashboard-accent: #1976d2;
  --dashboard-accent-soft: #e3f2fd;
  --dashboard-accent-text: #0d47a1;
}

.tpi-dashboard__card--status {
  --dashboard-accent: #8e24aa;
  --dashboard-accent-soft: #f3e5f5;
  --dashboard-accent-text: #6a1b9a;
}

.tpi-dashboard__card--status-amount {
  --dashboard-accent: #2e7d32;
  --dashboard-accent-soft: #e8f5e9;
  --dashboard-accent-text: #1b5e20;
}

.tpi-dashboard__card--dark {
  --dashboard-accent-readable: color-mix(in srgb, var(--dashboard-accent) 48%, #ffffff);
  --dashboard-accent-soft: color-mix(in srgb, var(--dashboard-accent) 18%, rgb(var(--v-theme-surface)));
  --dashboard-chip-bg: color-mix(in srgb, var(--dashboard-accent) 24%, rgba(0, 0, 0, .82));
  --dashboard-header-surface: color-mix(in srgb, var(--dashboard-accent) 7%, rgb(var(--v-theme-surface)));
  --dashboard-hover-bg: color-mix(in srgb, var(--dashboard-accent) 14%, rgb(var(--v-theme-surface)));
  --dashboard-title-color: rgba(var(--v-theme-on-surface), .96);
  --dashboard-total-bg: color-mix(in srgb, var(--dashboard-accent) 18%, rgb(var(--v-theme-surface)));
  border-color: rgba(var(--v-border-color), .5);
  box-shadow: 0 14px 32px rgba(0, 0, 0, .28);
}

.tpi-dashboard__header {
  align-items: flex-start;
  background: linear-gradient(135deg, var(--dashboard-accent-soft), var(--dashboard-header-surface) 52%);
  border-bottom: 1px solid rgba(var(--v-border-color), .24);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px;
}

.tpi-dashboard__heading {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.tpi-dashboard__icon {
  align-items: center;
  background: var(--dashboard-accent);
  border-radius: 8px;
  color: white;
  display: inline-flex;
  flex: 0 0 40px;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.tpi-dashboard__title {
  color: var(--dashboard-title-color);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
  padding: 0;
}

.tpi-dashboard__subtitle {
  color: rgba(var(--v-theme-on-surface), .66);
  font-size: .8rem;
  font-weight: 600;
  margin-top: 3px;
}

.tpi-dashboard__metrics {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tpi-dashboard__metric {
  background: var(--dashboard-chip-bg);
  color: var(--dashboard-accent-readable);
  font-weight: 800;
}

.tpi-dashboard__loader {
  color: var(--dashboard-accent);
}

.tpi-dashboard__loader--idle {
  opacity: .2;
}

.tpi-dashboard__table {
  flex: 1;
}

.tpi-dashboard__table :deep(th) {
  color: var(--dashboard-accent-readable);
  font-size: .76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.tpi-dashboard__table :deep(td),
.tpi-dashboard__table :deep(th) {
  border-bottom-color: rgba(var(--v-border-color), .22);
}

.tpi-dashboard__table :deep(tbody tr:hover) {
  background: var(--dashboard-hover-bg);
}

.tpi-dashboard__label {
  display: grid;
  gap: 7px;
  min-width: 180px;
}

.tpi-dashboard__bar {
  background: rgba(var(--v-theme-on-surface), .08);
  border-radius: 999px;
  height: 5px;
  overflow: hidden;
}

.tpi-dashboard__bar-value {
  background: var(--dashboard-accent);
  border-radius: inherit;
  height: 100%;
  min-width: 4px;
}

.tpi-dashboard__amount,
.tpi-dashboard__total {
  font-weight: 800;
}

.tpi-dashboard__percentage {
  color: var(--dashboard-accent-readable);
  font-weight: 800;
}

.tpi-dashboard__total {
  background: var(--dashboard-total-bg);
  color: var(--dashboard-title-color);
}

.tpi-dashboard__total-label {
  color: var(--dashboard-accent-readable);
}
</style>
