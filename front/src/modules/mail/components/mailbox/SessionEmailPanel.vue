<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import dayjs from "dayjs";
import type {SessionEmailState} from "@/modules/mail/interfaces/ISessionEmail";

const props = defineProps<{
  state: SessionEmailState | null
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  (e: "start"): void
  (e: "pause"): void
  (e: "resume"): void
  (e: "close"): void
}>()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const session = computed(() => props.state?.session || null)
const status = computed(() => session.value?.status)
const isActive = computed(() => status.value === "ACTIVE")
const isPaused = computed(() => status.value === "PAUSED")
const duration = computed(() => {
  if (!session.value?.startedAt) return "00:00:00"
  const start = dayjs(session.value.startedAt).valueOf()
  const end = session.value.endedAt ? dayjs(session.value.endedAt).valueOf() : now.value
  const seconds = Math.max(Math.floor((end - start) / 1000), 0)
  const hours = Math.floor(seconds / 3600).toString().padStart(2, "0")
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0")
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0")
  return `${hours}:${minutes}:${rest}`
})

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="session-email-panel">
    <v-btn
      v-if="!session"
      color="success"
      prepend-icon="mdi-play"
      block
      :loading="loading"
      :disabled="disabled"
      @click="$emit('start')"
    >
      Iniciar atención
    </v-btn>

    <v-sheet v-else rounded border class="pa-3">
      <div class="d-flex align-center justify-space-between ga-2">
        <div class="d-flex align-center ga-2 text-caption font-weight-bold">
          <v-icon
            :icon="isPaused ? 'mdi-pause-circle' : 'mdi-circle'"
            :color="isPaused ? 'warning' : 'success'"
            size="14"
          />
          <span>{{ isPaused ? 'ATENCIÓN PAUSADA' : 'ATENCIÓN ACTIVA' }}</span>
        </div>
        <span v-if="isActive" class="text-caption text-medium-emphasis">{{ duration }}</span>
      </div>

      <div class="session-metrics mt-3">
        <div>
          <span>Auto sesión</span>
          <strong>{{ session.assignedCount || 0 }}</strong>
        </div>
        <div>
          <span>Respuestas</span>
          <strong>{{ session.repliedCount || 0 }}</strong>
        </div>
        <div>
          <span>Cerrados</span>
          <strong>{{ session.closedCount || 0 }}</strong>
        </div>
        <div>
          <span>Auto en curso</span>
          <strong>{{ state?.currentAssignedCount || 0 }} / {{ session.maxAssignableEmails || 0 }}</strong>
        </div>
      </div>

      <div class="d-flex ga-2 mt-3">
        <v-btn
          v-if="isActive"
          size="small"
          variant="tonal"
          prepend-icon="mdi-pause"
          :loading="loading"
          @click="$emit('pause')"
        >
          Pausar
        </v-btn>
        <v-btn
          v-if="isPaused"
          size="small"
          color="success"
          variant="tonal"
          prepend-icon="mdi-play"
          :loading="loading"
          @click="$emit('resume')"
        >
          Reanudar
        </v-btn>
        <v-spacer />
        <v-btn
          size="small"
          color="error"
          variant="text"
          :loading="loading"
          @click="$emit('close')"
        >
          Finalizar
        </v-btn>
      </div>
    </v-sheet>
  </div>
</template>

<style scoped>
.session-email-panel {
  flex: 0 0 auto;
}
.session-metrics {
  display: grid;
  gap: 6px;
}
.session-metrics > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.78rem;
}
</style>
