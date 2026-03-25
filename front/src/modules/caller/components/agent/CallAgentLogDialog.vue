<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {ICallLog} from "../../interfaces/ICallLog";
import CallLogProvider from "../../providers/CallLogProvider";
import CallSuccessTypeProvider from "../../providers/CallSuccessTypeProvider";
import CallFailedTypeProvider from "../../providers/CallFailedTypeProvider";
import CallAgentDataPreview from "./CallAgentDataPreview.vue";

type CallState = 'pendiente' | 'intentada' | 'fallida' | 'promesa' | 'exitosa'

const modelValue = defineModel<boolean>({default: false})

const props = defineProps<{
  callLog: ICallLog | null
}>()

const emit = defineEmits<{
  updated: []
}>()

const loading = ref(false)
const loadingOptions = ref(false)
const successOptions = ref<string[]>([])
const failedOptions = ref<string[]>([])

const callState = ref<CallState>('pendiente')
const typification = ref('')
const promiseDate = ref<string | null>(null)
const notes = ref('')

const stateOptions: Array<{label: string, value: CallState, color: string}> = [
  {label: 'Ocupado / no contesta', value: 'intentada', color: 'secondary'},
  {label: 'Sin acuerdo', value: 'fallida', color: 'error'},
  {label: 'Promesa', value: 'promesa', color: 'info'},
  {label: 'Exitosa', value: 'exitosa', color: 'success'}
]

const currentTypeOptions = computed(() => {
  if (callState.value === 'exitosa') return successOptions.value
  if (callState.value === 'fallida') return failedOptions.value
  return []
})

const requireTypification = computed(() => ['fallida', 'exitosa'].includes(callState.value))
const requirePromiseDate = computed(() => callState.value === 'promesa')

const canSave = computed(() => {
  if (!props.callLog) return false
  if (requireTypification.value && !typification.value) return false
  if (requirePromiseDate.value && !promiseDate.value) return false
  return !!callState.value
})

watch(() => props.callLog, (value) => {
  callState.value = (value?.state as CallState) || 'pendiente'
  typification.value = value?.typification || ''
  promiseDate.value = value?.promiseDate ? toDateInput(value.promiseDate) : null
  notes.value = value?.notes || ''
}, {immediate: true})

watch(callState, (value) => {
  if (value === 'promesa') {
    typification.value = 'Promesa de pago'
  } else if (value !== 'fallida' && value !== 'exitosa') {
    typification.value = ''
    promiseDate.value = null
  } else {
    promiseDate.value = null
  }
})

watch(modelValue, (open) => {
  if (open && !successOptions.value.length && !failedOptions.value.length) {
    void fetchTypifications()
  }
})

async function fetchTypifications() {
  loadingOptions.value = true
  try {
    const [successResult, failedResult] = await Promise.all([
      CallSuccessTypeProvider.instance.find({limit: 200, orderBy: 'name', order: 'asc'}),
      CallFailedTypeProvider.instance.find({limit: 200, orderBy: 'name', order: 'asc'})
    ])

    successOptions.value = (successResult ?? []).map(item => item.name).filter(Boolean) as string[]
    failedOptions.value = (failedResult ?? []).map(item => item.name).filter(Boolean) as string[]
  } catch (error) {
    console.error('Error fetching typifications:', error)
  } finally {
    loadingOptions.value = false
  }
}

function toDateInput(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

async function save() {
  if (!props.callLog?._id || !canSave.value) return

  loading.value = true
  try {
    await CallLogProvider.instance.registerAttempt(props.callLog._id, {
      state: callState.value,
      notes: notes.value,
      typification: typification.value || '',
      promiseDate: promiseDate.value ? new Date(promiseDate.value) : null,
      done: callState.value === 'exitosa'
    })

    emit('updated')
    modelValue.value = false
  } catch (error) {
    console.error('Error updating call log:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-dialog
    v-model="modelValue"
    max-width="820"
  >
    <v-card>
      <v-card-item>
        <template #append>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="modelValue = false"
          />
        </template>
        <v-card-title>Registro de llamada</v-card-title>
        <v-card-subtitle>
          Definí el resultado de la gestión y guardá el intento.
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="d-flex flex-column ga-6">
        <div>
          <div class="text-subtitle-2 mb-2">
            Datos del registro
          </div>
          <CallAgentDataPreview
            :data="callLog?.data"
            mode="table"
            :max-entries="6"
          />
        </div>

        <div class="d-flex flex-wrap ga-2">
          <v-btn
            v-for="option in stateOptions"
            :key="option.value"
            :color="callState === option.value ? option.color : undefined"
            :variant="callState === option.value ? 'flat' : 'outlined'"
            @click="callState = option.value"
          >
            {{ option.label }}
          </v-btn>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-if="requireTypification"
              v-model="typification"
              :items="currentTypeOptions"
              :loading="loadingOptions"
              label="Tipificación"
              variant="outlined"
              hide-details="auto"
            />

            <v-text-field
              v-else-if="requirePromiseDate"
              v-model="promiseDate"
              type="date"
              label="Fecha de promesa"
              variant="outlined"
              hide-details="auto"
            />

            <div
              v-else
              class="text-medium-emphasis pt-3"
            >
              No requiere datos adicionales.
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-textarea
              v-model="notes"
              label="Notas"
              variant="outlined"
              rows="4"
              hide-details="auto"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          variant="text"
          @click="modelValue = false"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!canSave"
          @click="save"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
