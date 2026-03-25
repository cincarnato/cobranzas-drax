<script setup lang="ts">
import {computed} from "vue";
import type {ICallList} from "../../interfaces/ICallList";

const props = defineProps<{
  callList: ICallList
  loading?: boolean
}>()

const processed = computed(() => (props.callList.success ?? 0) + (props.callList.failed ?? 0) + (props.callList.promises ?? 0))
const missing = computed(() => Math.max((props.callList.total ?? 0) - processed.value, 0))

const stats = computed(() => [
  {label: 'Registros totales', value: props.callList.total ?? 0},
  {label: 'Exitosas', value: props.callList.success ?? 0},
  {label: 'Promesas', value: props.callList.promises ?? 0},
  {label: 'Sin acuerdo', value: props.callList.failed ?? 0},
  {label: 'Pendientes', value: missing.value}
])

const deadlineVariant = computed(() => {
  if (!props.callList.deadline) return 'default'
  const deadline = new Date(props.callList.deadline)
  return deadline.getTime() < Date.now() ? 'warning' : 'success'
})

const attemptsControl = computed(() => props.callList.attemptsControl ?? [])

function formatDate(date?: Date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-AR')
}

function percentage(count?: number) {
  const total = props.callList.total ?? 0
  if (!total) return 0
  return Math.round(((count ?? 0) / total) * 100)
}
</script>

<template>
  <v-card
    :loading="loading"
    class="fill-height"
  >
    <v-card-item>
      <v-card-title>{{ callList.name }}</v-card-title>
      <v-card-subtitle class="d-flex flex-wrap ga-2 align-center">
        <span v-if="callList.group?.name">{{ callList.group.name }}</span>
        <span v-if="callList.group?.name && callList.user?.username">-</span>
        <span v-if="callList.user?.username">{{ callList.user.username }}</span>
        <v-chip
          v-if="callList.deadline"
          :color="deadlineVariant"
          size="small"
          variant="tonal"
        >
          Vence {{ formatDate(callList.deadline) }}
        </v-chip>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="d-flex flex-column ga-4">
      <div class="d-flex flex-column ga-2">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="d-flex justify-space-between align-center summary-row"
        >
          <span>{{ stat.label }}</span>
          <strong>{{ stat.value }}</strong>
        </div>
      </div>

      <div>
        <div class="text-subtitle-2 mb-2">
          Progreso general
        </div>
        <v-progress-linear
          color="success"
          :model-value="percentage(processed)"
          height="12"
          rounded
        />
        <div class="text-caption text-medium-emphasis mt-1">
          {{ processed }} gestionados de {{ callList.total ?? 0 }}
        </div>
      </div>

      <div>
        <div class="text-subtitle-2 mb-2">
          Total intentos: {{ callList.attempts ?? 0 }}
        </div>
        <div class="d-flex flex-column ga-3">
          <div
            v-for="attempt in attemptsControl"
            :key="attempt.number"
          >
            <div class="d-flex justify-space-between text-caption mb-1">
              <span>Intento {{ attempt.number ?? '-' }}</span>
              <span>{{ attempt.count ?? 0 }} registros</span>
            </div>
            <v-progress-linear
              color="primary"
              :model-value="percentage(attempt.count)"
              height="8"
              rounded
            />
          </div>
          <div
            v-if="!attemptsControl.length"
            class="text-medium-emphasis"
          >
            Sin historial de intentos.
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.summary-row {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 10px;
}
</style>
