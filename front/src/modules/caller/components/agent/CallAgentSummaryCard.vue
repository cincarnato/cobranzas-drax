<script setup lang="ts">
import {computed, ref} from "vue";
import type {ICallList} from "../../interfaces/ICallList";
import CallLogProvider from "../../providers/CallLogProvider";

const props = defineProps<{
  callList: ICallList
  loading?: boolean
}>()

const exportLoading = ref(false)
const exportError = ref('')

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

function resolveFileName(response: Response) {
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const match = contentDisposition.match(/filename=\"?([^"]+)\"?/)
  return match?.[1] ?? `${props.callList.name}.xlsx`
}

async function exportCallLog() {
  if (!props.callList._id) return

  exportLoading.value = true
  exportError.value = ''

  try {
    const response = await CallLogProvider.instance.exportExcel(props.callList._id)

    if (!response.ok) {
      let message = 'No se pudo exportar el archivo.'

      try {
        const body = await response.json()
        message = body?.message ?? message
      } catch {
        // ignore invalid json error bodies
      }

      throw new Error(message)
    }

    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = resolveFileName(response)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)
  } catch (e: any) {
    exportError.value = e?.message ?? 'Ocurrio un error al exportar.'
  } finally {
    exportLoading.value = false
  }
}
</script>

<template>
    <v-card
    :loading="loading"
    class="fill-height"
  >
    <v-card-item>
      <div class="d-flex align-start justify-space-between ga-3">
        <div class="min-width-0 flex-grow-1">
          <v-card-title class="px-0">{{ callList.name }}</v-card-title>
          <v-card-subtitle class="d-flex flex-wrap ga-2 align-center px-0">
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
        </div>

        <v-btn
          v-if="callList.isExportable"
          color="primary"
          variant="outlined"
          prepend-icon="mdi-file-excel-outline"
          size="small"
          density="comfortable"
          :loading="exportLoading"
          @click="exportCallLog"
        >
          Exportar
        </v-btn>
      </div>
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

      <v-alert
        v-if="exportError"
        type="error"
        variant="tonal"
        density="compact"
      >
        {{ exportError }}
      </v-alert>
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
