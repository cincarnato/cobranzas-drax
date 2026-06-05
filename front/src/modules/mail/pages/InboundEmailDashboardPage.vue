<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {IDraxFieldFilter} from "@drax/crud-share";
import {VDateInput} from "vuetify/labs/VDateInput";
import {useTheme} from "vuetify";
import InboundEmailProvider from "../providers/InboundEmailProvider";

type InboundDimension = "total" | "category" | "sentiment" | "isDuplicate" | "hasAttachments"
type Accent = "total" | "category" | "sentiment" | "duplicate" | "attachments"
type DateGroupFormat = "day" | "month" | "year"

type InboundGroupByRow = {
  receivedAt?: unknown
  category?: unknown
  sentiment?: unknown
  isDuplicate?: unknown
  hasAttachments?: unknown
  count?: number
}

type SummaryRow = {
  day: string
  label: string
  count: number
  percentage: number
}

type CardConfig = {
  title: string
  label: string
  dimension: InboundDimension
  icon: string
  accent: Accent
  rows: SummaryRow[]
}

const theme = useTheme();
const today = new Date(new Date().setHours(0, 0, 0, 0));
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const fromDate = ref<Date | null>(monthStart);
const toDate = ref<Date | null>(today);
const dateGroupFormat = ref<DateGroupFormat>("day");
const totalRows = ref<SummaryRow[]>([]);
const categoryRows = ref<SummaryRow[]>([]);
const sentimentRows = ref<SummaryRow[]>([]);
const duplicateRows = ref<SummaryRow[]>([]);
const attachmentsRows = ref<SummaryRow[]>([]);
const loading = ref(false);
const error = ref("");
let requestId = 0;

const isDarkTheme = computed(() => theme.current.value.dark);

const numberFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateGroupOptions = [
  {title: "Día", value: "day"},
  {title: "Mes", value: "month"},
  {title: "Año", value: "year"},
];

const dateGroupLabel = computed(() => {
  if (dateGroupFormat.value === "year") return "año";
  if (dateGroupFormat.value === "month") return "mes";
  return "día";
});
const dateGroupHeader = computed(() => {
  if (dateGroupFormat.value === "year") return "Año";
  if (dateGroupFormat.value === "month") return "Mes";
  return "Día";
});

const cards = computed<CardConfig[]>(() => [
  {
    title: `Total de correos por ${dateGroupLabel.value}`,
    label: "Total",
    dimension: "total",
    icon: "mdi-email-multiple-outline",
    accent: "total",
    rows: totalRows.value,
  },
  {
    title: `Correos por ${dateGroupLabel.value} y categoría`,
    label: "Categoría",
    dimension: "category",
    icon: "mdi-shape-outline",
    accent: "category",
    rows: categoryRows.value,
  },
  {
    title: `Correos por ${dateGroupLabel.value} y sentimiento`,
    label: "Sentimiento",
    dimension: "sentiment",
    icon: "mdi-emoticon-outline",
    accent: "sentiment",
    rows: sentimentRows.value,
  },
  {
    title: `Correos duplicados por ${dateGroupLabel.value}`,
    label: "Duplicado",
    dimension: "isDuplicate",
    icon: "mdi-content-duplicate",
    accent: "duplicate",
    rows: duplicateRows.value,
  },
  {
    title: `Correos con adjuntos por ${dateGroupLabel.value}`,
    label: "Adjuntos",
    dimension: "hasAttachments",
    icon: "mdi-paperclip",
    accent: "attachments",
    rows: attachmentsRows.value,
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
    filters.push({field: "receivedAt", operator: "gte", value: getStartOfDay(fromDate.value)});
  }

  if (toDate.value) {
    filters.push({field: "receivedAt", operator: "lte", value: getEndOfDay(toDate.value)});
  }

  return filters;
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

function formatDateGroup(value: unknown): string {
  if (!value) return "Sin fecha";

  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return String(value);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  if (dateGroupFormat.value === "year") {
    return String(year);
  }

  if (dateGroupFormat.value === "month") {
    return `${month}/${year}`;
  }

  return `${day}/${month}/${year}`;
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

function toSummaryRows(rows: InboundGroupByRow[], dimension: InboundDimension): SummaryRow[] {
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

  return rows.map(row => {
    const count = Number(row.count ?? 0);

    return {
      day: formatDateGroup(row.receivedAt),
      label: dimension === "total" ? "Total" : getDisplayValue(row[dimension]),
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    };
  });
}

function getTotalCount(rows: SummaryRow[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}

function getRowKey(row: SummaryRow): string {
  return `${row.day}-${row.label}`;
}

function clearDashboardRows() {
  totalRows.value = [];
  categoryRows.value = [];
  sentimentRows.value = [];
  duplicateRows.value = [];
  attachmentsRows.value = [];
}

async function fetchDashboardData() {
  const currentRequestId = ++requestId;
  loading.value = true;
  error.value = "";

  try {
    const filters = buildFilters();
    const dateFormat = dateGroupFormat.value;
    const [totalData, categoryData, sentimentData, duplicateData, attachmentsData] = await Promise.all([
      InboundEmailProvider.instance.groupBy({fields: ["receivedAt"], filters, dateFormat}),
      InboundEmailProvider.instance.groupBy({fields: ["receivedAt", "category"], filters, dateFormat}),
      InboundEmailProvider.instance.groupBy({fields: ["receivedAt", "sentiment"], filters, dateFormat}),
      InboundEmailProvider.instance.groupBy({fields: ["receivedAt", "isDuplicate"], filters, dateFormat}),
      InboundEmailProvider.instance.groupBy({fields: ["receivedAt", "hasAttachments"], filters, dateFormat}),
    ]);

    if (currentRequestId !== requestId) return;

    totalRows.value = toSummaryRows(totalData as InboundGroupByRow[], "total");
    categoryRows.value = toSummaryRows(categoryData as InboundGroupByRow[], "category");
    sentimentRows.value = toSummaryRows(sentimentData as InboundGroupByRow[], "sentiment");
    duplicateRows.value = toSummaryRows(duplicateData as InboundGroupByRow[], "isDuplicate");
    attachmentsRows.value = toSummaryRows(attachmentsData as InboundGroupByRow[], "hasAttachments");
  } catch (fetchError) {
    if (currentRequestId !== requestId) return;

    console.error("Error loading inbound email dashboard", fetchError);
    clearDashboardRows();
    error.value = "No se pudo cargar el dashboard de correos entrantes.";
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false;
    }
  }
}

function resetFilters() {
  fromDate.value = monthStart;
  toDate.value = today;
  dateGroupFormat.value = "day";
}

watch([fromDate, toDate, dateGroupFormat], () => {
  fetchDashboardData();
}, {immediate: true});
</script>

<template>
  <v-container fluid>
    <div class="email-dashboard">
      <v-card class="email-dashboard__filters" variant="outlined">
        <v-card-item>
          <v-card-title>Dashboard de correos entrantes</v-card-title>
          <v-card-subtitle>
            Filtrá por fecha de recepción y elegí si agrupar por día, mes o año.
          </v-card-subtitle>
        </v-card-item>

        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="4" lg="3">
              <v-date-input
                v-model="fromDate"
                label="Recibido desde"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4" lg="3">
              <v-date-input
                v-model="toDate"
                label="Recibido hasta"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4" lg="3">
              <v-select
                v-model="dateGroupFormat"
                :items="dateGroupOptions"
                label="Agrupar por"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="auto" class="email-dashboard__actions">
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

      <v-row class="email-dashboard__cards mt-4">
        <v-col
          v-for="card in cards"
          :key="card.dimension"
          cols="12"
          md="6"
          class="d-flex"
        >
          <v-card
            class="email-dashboard__card"
            :class="[
              `email-dashboard__card--${card.accent}`,
              {'email-dashboard__card--dark': isDarkTheme},
            ]"
            variant="outlined"
          >
            <div class="email-dashboard__header">
              <div class="email-dashboard__heading">
                <div class="email-dashboard__icon">
                  <v-icon :icon="card.icon" />
                </div>
                <div>
                  <v-card-title class="email-dashboard__title">
                    {{ card.title }}
                  </v-card-title>
                  <div class="email-dashboard__subtitle">
                    {{ formatNumber(getTotalCount(card.rows)) }} correos registrados
                  </div>
                </div>
              </div>

              <div class="email-dashboard__metrics">
                <v-chip class="email-dashboard__metric" size="small" variant="flat">
                  {{ card.rows.length }} filas
                </v-chip>
              </div>
            </div>

            <v-progress-linear
              v-if="loading"
              class="email-dashboard__loader"
              indeterminate
            />
            <v-progress-linear
              v-else
              class="email-dashboard__loader email-dashboard__loader--idle"
              model-value="100"
            />

            <v-table class="email-dashboard__table" density="compact" fixed-header>
              <thead>
                <tr>
                  <th class="text-left">{{ dateGroupHeader }}</th>
                  <th class="text-left">{{ card.label }}</th>
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!loading && card.rows.length === 0">
                  <td class="text-center text-medium-emphasis" colspan="4">
                    No hay datos para los filtros seleccionados
                  </td>
                </tr>

                <tr v-for="row in card.rows" :key="getRowKey(row)">
                  <td class="email-dashboard__day">{{ row.day }}</td>
                  <td>
                    <div class="email-dashboard__label">
                      <span>{{ row.label }}</span>
                      <div class="email-dashboard__bar">
                        <div
                          class="email-dashboard__bar-value"
                          :style="{width: `${row.percentage}%`}"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="text-right">{{ formatNumber(row.count) }}</td>
                  <td class="text-right">
                    <v-chip class="email-dashboard__percentage" size="x-small" variant="tonal">
                      {{ formatPercentage(row.percentage) }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="email-dashboard__total">
                  <td><span class="email-dashboard__total-label">Total</span></td>
                  <td></td>
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
.email-dashboard {
  width: 100%;
}

.email-dashboard__filters {
  border-color: rgba(var(--v-border-color), .42);
  border-radius: 8px;
}

.email-dashboard__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.email-dashboard__cards {
  align-items: stretch;
}

.email-dashboard__card {
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

.email-dashboard__card--total {
  --dashboard-accent: #455a64;
  --dashboard-accent-soft: #eceff1;
  --dashboard-accent-text: #263238;
}

.email-dashboard__card--category {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
}

.email-dashboard__card--sentiment {
  --dashboard-accent: #1976d2;
  --dashboard-accent-soft: #e3f2fd;
  --dashboard-accent-text: #0d47a1;
}

.email-dashboard__card--duplicate {
  --dashboard-accent: #6d4c41;
  --dashboard-accent-soft: #efebe9;
  --dashboard-accent-text: #4e342e;
}

.email-dashboard__card--attachments {
  --dashboard-accent: #f57c00;
  --dashboard-accent-soft: #fff3e0;
  --dashboard-accent-text: #e65100;
}

.email-dashboard__card--dark {
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

.email-dashboard__header {
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

.email-dashboard__heading {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.email-dashboard__icon {
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

.email-dashboard__title {
  color: var(--dashboard-title-color);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  padding: 0;
}

.email-dashboard__subtitle {
  color: rgba(var(--v-theme-on-surface), .62);
  font-size: .78rem;
  line-height: 1.4;
  margin-top: 2px;
}

.email-dashboard__metrics {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.email-dashboard__metric {
  background: var(--dashboard-chip-bg);
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.email-dashboard__loader {
  color: var(--dashboard-accent);
}

.email-dashboard__loader--idle {
  opacity: .16;
}

.email-dashboard__table {
  flex: 1;
}

.email-dashboard__table :deep(table) {
  min-width: 520px;
}

.email-dashboard__table :deep(th),
.email-dashboard__table :deep(td) {
  white-space: nowrap;
}

.email-dashboard__table :deep(th) {
  background: rgba(var(--v-theme-surface), .96);
  color: rgba(var(--v-theme-on-surface), .66);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.email-dashboard__table :deep(tbody tr) {
  transition: background-color .16s ease, transform .16s ease;
}

.email-dashboard__table :deep(tbody tr:hover) {
  background: var(--dashboard-hover-bg);
}

.email-dashboard__table :deep(tfoot td) {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.email-dashboard__day {
  color: rgba(var(--v-theme-on-surface), .74);
  font-weight: 600;
}

.email-dashboard__label {
  display: grid;
  gap: 6px;
  min-width: 170px;
}

.email-dashboard__label span {
  font-weight: 600;
}

.email-dashboard__bar {
  background: rgba(var(--v-theme-on-surface), .08);
  border-radius: 999px;
  height: 5px;
  overflow: hidden;
  width: 100%;
}

.email-dashboard__bar-value {
  background: linear-gradient(90deg, var(--dashboard-accent), color-mix(in srgb, var(--dashboard-accent) 62%, white));
  border-radius: inherit;
  height: 100%;
  min-width: 4px;
}

.email-dashboard__percentage {
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.email-dashboard__total {
  background: var(--dashboard-total-bg);
  font-weight: 700;
}

.email-dashboard__total-label {
  color: var(--dashboard-accent-readable);
}

@media (max-width: 640px) {
  .email-dashboard__header {
    flex-direction: column;
  }

  .email-dashboard__metrics {
    align-items: flex-start;
  }
}
</style>
