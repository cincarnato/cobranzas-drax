<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {IDraxFieldFilter} from "@drax/crud-share";
import {useAuth} from "@drax/identity-vue";
import {useTheme} from "vuetify";
import CovenantProvider from "../../providers/CovenantProvider";
import CallAttemptProvider from "../../../caller/providers/CallAttemptProvider";
import WhatsappMessageProvider from "../../../caller/providers/WhatsappMessageProvider";

type GroupByRow = {
  group?: unknown
  createdBy?: unknown
  user?: unknown
  result?: string | null
  template?: string | null
  amount?: number | string | null
  count?: number
}

type SummaryRow = {
  label: string
  secondaryLabel?: string
  amount: number
  count: number
  percentage: number
}

type SummaryConfig = {
  title: string
  label: string
  secondaryLabel?: string
  dimension: "group" | "createdBy" | "user" | "userResult" | "whatsappUser" | "whatsappUserTemplate"
  icon: string
  accent: "zone" | "user" | "attempts" | "results" | "whatsapp" | "templates"
  showAmount: boolean
  rows: SummaryRow[]
}

const props = defineProps<{
  filters?: IDraxFieldFilter[]
}>();

const emit = defineEmits<{
  (event: "loading-change", value: boolean): void
}>();

const {hasPermission} = useAuth();
const theme = useTheme();

const zoneRows = ref<SummaryRow[]>([]);
const userRows = ref<SummaryRow[]>([]);
const attemptUserRows = ref<SummaryRow[]>([]);
const attemptUserResultRows = ref<SummaryRow[]>([]);
const whatsappUserRows = ref<SummaryRow[]>([]);
const whatsappUserTemplateRows = ref<SummaryRow[]>([]);
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

const canViewCovenants = computed(() => hasPermission("covenant:view"));
const canViewCallAttempts = computed(() => hasPermission("callattempt:view"));
const canViewWhatsappMessages = computed(() => hasPermission("whatsappmessage:view"));
const isDarkTheme = computed(() => theme.current.value.dark);

const cards = computed<SummaryConfig[]>(() => [
  ...(canViewCovenants.value ? [
    {
      title: "Resumen por zona",
      label: "Zona",
      dimension: "group" as const,
      icon: "mdi-map-marker-radius-outline",
      accent: "zone" as const,
      showAmount: true,
      rows: zoneRows.value,
    },
    {
      title: "Resumen por usuario",
      label: "Usuario",
      dimension: "createdBy" as const,
      icon: "mdi-account-heart-outline",
      accent: "user" as const,
      showAmount: true,
      rows: userRows.value,
    },
  ] : []),
  ...(canViewCallAttempts.value ? [
    {
      title: "Intentos por usuario",
      label: "Usuario",
      dimension: "user" as const,
      icon: "mdi-phone-outgoing-outline",
      accent: "attempts" as const,
      showAmount: false,
      rows: attemptUserRows.value,
    },
    {
      title: "Intentos por usuario y resultado",
      label: "Usuario",
      secondaryLabel: "Resultado",
      dimension: "userResult" as const,
      icon: "mdi-chart-bar-stacked",
      accent: "results" as const,
      showAmount: false,
      rows: attemptUserResultRows.value,
    },
  ] : []),
  ...(canViewWhatsappMessages.value ? [
    {
      title: "Whatsapps enviados por usuario",
      label: "Usuario",
      dimension: "whatsappUser" as const,
      icon: "mdi-whatsapp",
      accent: "whatsapp" as const,
      showAmount: false,
      rows: whatsappUserRows.value,
    },
    {
      title: "Whatsapps enviados por usuario y template",
      label: "Usuario",
      secondaryLabel: "Template",
      dimension: "whatsappUserTemplate" as const,
      icon: "mdi-message-text-outline",
      accent: "templates" as const,
      showAmount: false,
      rows: whatsappUserTemplateRows.value,
    },
  ] : []),
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

function getStartOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getNextDay(value: Date): Date {
  const date = getStartOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
}

function normalizeDateFilters(filters: IDraxFieldFilter[] = [], dateField = "date"): IDraxFieldFilter[] {
  return filters.flatMap(filter => {
    if (filter.field !== "date" || filter.operator !== "eq" || !filter.value) {
      return [{...filter, field: filter.field === "date" ? dateField : filter.field}];
    }

    const date = new Date(filter.value);
    if (Number.isNaN(date.getTime())) {
      return [{...filter, field: dateField}];
    }

    return [
      {field: dateField, operator: "gte", value: getStartOfDay(date)},
      {field: dateField, operator: "lt", value: getNextDay(date)},
    ];
  });
}

function toSummaryRows(rows: GroupByRow[], dimension: "group" | "createdBy" | "user"): SummaryRow[] {
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

  return rows.map(row => {
    const count = Number(row.count ?? 0);

    return {
      label: getDisplayValue(row[dimension]),
      amount: parseAmount(row.amount),
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    };
  });
}

function toUserResultSummaryRows(rows: GroupByRow[]): SummaryRow[] {
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

  return rows.map(row => {
    const count = Number(row.count ?? 0);

    return {
      label: getDisplayValue(row.user),
      secondaryLabel: row.result ? String(row.result) : "Sin resultado",
      amount: 0,
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    };
  });
}

function toUserTemplateSummaryRows(rows: GroupByRow[]): SummaryRow[] {
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

  return rows.map(row => {
    const count = Number(row.count ?? 0);

    return {
      label: getDisplayValue(row.user),
      secondaryLabel: row.template ? String(row.template) : "Sin template",
      amount: 0,
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
  zoneRows.value = [];
  userRows.value = [];
  attemptUserRows.value = [];
  attemptUserResultRows.value = [];
  whatsappUserRows.value = [];
  whatsappUserTemplateRows.value = [];
}

async function fetchDashboardData() {
  const currentRequestId = ++requestId;
  loading.value = true;
  emit("loading-change", true);
  error.value = "";

  try {
    const filters = normalizeDateFilters(props.filters ?? []);
    const whatsappFilters = normalizeDateFilters(props.filters ?? [], "sentAt");
    const [
      zoneData,
      userData,
      attemptUserData,
      attemptUserResultData,
      whatsappUserData,
      whatsappUserTemplateData,
    ] = await Promise.all([
      canViewCovenants.value ? CovenantProvider.instance.groupBy({
        fields: ["group", "amount"],
        filters,
      }) : Promise.resolve([]),
      canViewCovenants.value ? CovenantProvider.instance.groupBy({
        fields: ["createdBy", "amount"],
        filters,
      }) : Promise.resolve([]),
      canViewCallAttempts.value ? CallAttemptProvider.instance.groupBy({
        fields: ["user"],
        filters,
      }) : Promise.resolve([]),
      canViewCallAttempts.value ? CallAttemptProvider.instance.groupBy({
        fields: ["user", "result"],
        filters,
      }) : Promise.resolve([]),
      canViewWhatsappMessages.value ? WhatsappMessageProvider.instance.groupBy({
        fields: ["user"],
        filters: whatsappFilters,
      }) : Promise.resolve([]),
      canViewWhatsappMessages.value ? WhatsappMessageProvider.instance.groupBy({
        fields: ["user", "template"],
        filters: whatsappFilters,
      }) : Promise.resolve([]),
    ]);

    if (currentRequestId !== requestId) return;

    zoneRows.value = toSummaryRows(zoneData as GroupByRow[], "group");
    userRows.value = toSummaryRows(userData as GroupByRow[], "createdBy");
    attemptUserRows.value = toSummaryRows(attemptUserData as GroupByRow[], "user");
    attemptUserResultRows.value = toUserResultSummaryRows(attemptUserResultData as GroupByRow[]);
    whatsappUserRows.value = toSummaryRows(whatsappUserData as GroupByRow[], "user");
    whatsappUserTemplateRows.value = toUserTemplateSummaryRows(whatsappUserTemplateData as GroupByRow[]);
  } catch (fetchError) {
    if (currentRequestId !== requestId) return;

    console.error("Error loading covenant dashboard", fetchError);
    clearDashboardRows();
    error.value = "No se pudo cargar el resumen de cobranzas.";
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false;
      emit("loading-change", false);
    }
  }
}

watch(
  [() => props.filters, canViewCovenants, canViewCallAttempts, canViewWhatsappMessages],
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
  <div class="custom-dashboard">
    <v-alert
      v-if="error"
      class="mb-4"
      type="error"
      variant="tonal"
      density="compact"
    >
      {{ error }}
    </v-alert>

    <v-row class="custom-dashboard__cards">
      <v-col
        v-for="card in cards"
        :key="card.dimension"
        cols="12"
        md="6"
        class="d-flex"
      >
        <v-card
          class="custom-dashboard__card"
          :class="[
            `custom-dashboard__card--${card.accent}`,
            {'custom-dashboard__card--dark': isDarkTheme},
          ]"
          variant="outlined"
        >
          <div class="custom-dashboard__header">
            <div class="custom-dashboard__heading">
              <div class="custom-dashboard__icon">
                <v-icon :icon="card.icon" />
              </div>
              <div>
                <v-card-title class="custom-dashboard__title">
                  {{ card.title }}
                </v-card-title>
                <div class="custom-dashboard__subtitle">
                  {{ formatNumber(getTotalCount(card.rows)) }} items registrados
                </div>
              </div>
            </div>

            <div class="custom-dashboard__metrics">
              <v-chip
                v-if="card.showAmount"
                class="custom-dashboard__metric"
                size="small"
                variant="flat"
              >
                {{ formatCurrency(getTotalAmount(card.rows)) }}
              </v-chip>
              <v-chip
                class="custom-dashboard__metric"
                size="small"
                variant="tonal"
              >
                {{ card.rows.length }} filas
              </v-chip>
            </div>
          </div>

          <v-progress-linear
            v-if="loading"
            class="custom-dashboard__loader"
            indeterminate
          />
          <v-progress-linear
            v-else
            class="custom-dashboard__loader custom-dashboard__loader--idle"
            model-value="100"
          />

          <v-table
            class="custom-dashboard__table"
            density="compact"
            fixed-header
          >
            <thead>
              <tr>
                <th class="text-left">{{ card.label }}</th>
                <th
                  v-if="card.secondaryLabel"
                  class="text-left"
                >
                  {{ card.secondaryLabel }}
                </th>
                <th
                  v-if="card.showAmount"
                  class="text-right"
                >
                  Monto
                </th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && card.rows.length === 0">
                <td
                  class="text-center text-medium-emphasis"
                  :colspan="card.showAmount ? 4 : card.secondaryLabel ? 4 : 3"
                >
                  No hay datos para la fecha seleccionada
                </td>
              </tr>

              <tr
                v-for="row in card.rows"
                :key="row.label"
              >
                <td>
                  <div class="custom-dashboard__label">
                    <span>{{ row.label }}</span>
                    <div class="custom-dashboard__bar">
                      <div
                        class="custom-dashboard__bar-value"
                        :style="{width: `${row.percentage}%`}"
                      />
                    </div>
                  </div>
                </td>
                <td
                  v-if="card.secondaryLabel"
                  class="custom-dashboard__result"
                >
                  {{ row.secondaryLabel }}
                </td>
                <td
                  v-if="card.showAmount"
                  class="text-right custom-dashboard__amount"
                >
                  {{ formatCurrency(row.amount) }}
                </td>
                <td class="text-right">{{ formatNumber(row.count) }}</td>
                <td class="text-right">
                  <v-chip
                    class="custom-dashboard__percentage"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ formatPercentage(row.percentage) }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="custom-dashboard__total">
                <td>
                  <span class="custom-dashboard__total-label">Total</span>
                </td>
                <td v-if="card.secondaryLabel"></td>
                <td
                  v-if="card.showAmount"
                  class="text-right"
                >
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
</template>

<style scoped>
.custom-dashboard {
  width: 100%;
}

.custom-dashboard__cards {
  align-items: stretch;
}

.custom-dashboard__card {
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
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 420px;
  overflow: hidden;
  border-color: rgba(var(--v-border-color), .42);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(30, 42, 55, .08);
}

.custom-dashboard__card--zone {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
}

.custom-dashboard__card--user {
  --dashboard-accent: #d81b60;
  --dashboard-accent-soft: #fce4ec;
  --dashboard-accent-text: #ad1457;
}

.custom-dashboard__card--attempts {
  --dashboard-accent: #1976d2;
  --dashboard-accent-soft: #e3f2fd;
  --dashboard-accent-text: #0d47a1;
}

.custom-dashboard__card--results {
  --dashboard-accent: #6d4c41;
  --dashboard-accent-soft: #efebe9;
  --dashboard-accent-text: #4e342e;
}

.custom-dashboard__card--whatsapp {
  --dashboard-accent: #2e7d32;
  --dashboard-accent-soft: #e8f5e9;
  --dashboard-accent-text: #1b5e20;
}

.custom-dashboard__card--templates {
  --dashboard-accent: #5e35b1;
  --dashboard-accent-soft: #ede7f6;
  --dashboard-accent-text: #4527a0;
}

.custom-dashboard__card--dark {
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

.custom-dashboard__header {
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

.custom-dashboard__heading {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.custom-dashboard__icon {
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

.custom-dashboard__title {
  color: var(--dashboard-title-color);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  padding: 0;
}

.custom-dashboard__subtitle {
  color: rgba(var(--v-theme-on-surface), .62);
  font-size: .78rem;
  line-height: 1.4;
  margin-top: 2px;
}

.custom-dashboard__metrics {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-dashboard__metric {
  background: var(--dashboard-chip-bg);
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.custom-dashboard__loader {
  color: var(--dashboard-accent);
}

.custom-dashboard__loader--idle {
  opacity: .16;
}

.custom-dashboard__table {
  flex: 1;
}

.custom-dashboard__table :deep(table) {
  min-width: 520px;
}

.custom-dashboard__table :deep(th),
.custom-dashboard__table :deep(td) {
  white-space: nowrap;
}

.custom-dashboard__table :deep(th) {
  background: rgba(var(--v-theme-surface), .96);
  color: rgba(var(--v-theme-on-surface), .66);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.custom-dashboard__table :deep(tbody tr) {
  transition: background-color .16s ease, transform .16s ease;
}

.custom-dashboard__table :deep(tbody tr:hover) {
  background: var(--dashboard-hover-bg);
}

.custom-dashboard__table :deep(tfoot td) {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.custom-dashboard__label {
  display: grid;
  gap: 6px;
  min-width: 170px;
}

.custom-dashboard__label span {
  font-weight: 600;
}

.custom-dashboard__bar {
  background: rgba(var(--v-theme-on-surface), .08);
  border-radius: 999px;
  height: 5px;
  overflow: hidden;
  width: 100%;
}

.custom-dashboard__bar-value {
  background: linear-gradient(90deg, var(--dashboard-accent), color-mix(in srgb, var(--dashboard-accent) 62%, white));
  border-radius: inherit;
  height: 100%;
  min-width: 4px;
}

.custom-dashboard__amount {
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.custom-dashboard__result {
  color: rgba(var(--v-theme-on-surface), .72);
  font-weight: 600;
}

.custom-dashboard__percentage {
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.custom-dashboard__total {
  background: var(--dashboard-total-bg);
  font-weight: 700;
}

.custom-dashboard__total-label {
  color: var(--dashboard-accent-readable);
}

@media (max-width: 640px) {
  .custom-dashboard__header {
    flex-direction: column;
  }

  .custom-dashboard__metrics {
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
