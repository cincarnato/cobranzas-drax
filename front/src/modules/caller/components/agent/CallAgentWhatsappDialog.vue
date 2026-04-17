<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {ICallLog} from "../../interfaces/ICallLog";
import CallAgentDataPreview from "./CallAgentDataPreview.vue";
import MultichannelProvider from "../../providers/MultichannelProvider";

const modelValue = defineModel<boolean>({default: false})

const props = defineProps<{
  callLog: ICallLog | null
}>()

const templates = [
  'fc_vencida',
  'vencimiento_10',
  'llamado_cuota',
  'estimado_afiliado',
  'recordatorio_de_deuda_'
]

const loading = ref(false)
const telefono = ref('')
const template = ref<string | null>(templates[0] ?? null)
const successMessage = ref('')
const errorMessage = ref('')

const canSend = computed(() => {
  return !!sanitizePhoneNumber(telefono.value) && !!template.value
})

watch(() => props.callLog, (value) => {
  telefono.value = sanitizePhoneNumber(extractPhoneNumber(value?.data))
}, {immediate: true})

watch(modelValue, (open) => {
  if (open) {
    successMessage.value = ''
    errorMessage.value = ''
    template.value = templates[0] ?? null
    telefono.value = sanitizePhoneNumber(extractPhoneNumber(props.callLog?.data))
  }
})

watch(telefono, (value) => {
  const sanitized = sanitizePhoneNumber(value)

  if (sanitized !== value) {
    telefono.value = sanitized
  }
})

function sanitizePhoneNumber(value?: string | null) {
  return String(value ?? '').replace(/\D+/g, '')
}

function extractPhoneNumber(data?: Record<string, any> | Array<Record<string, any>>) {
  if (!data) return ''

  const entries = Array.isArray(data)
    ? data.flatMap(item => Object.entries(item ?? {}))
    : Object.entries(data)

  const phoneEntry = entries.find(([key, value]) => {
    if (value == null) return false
    const normalizedKey = key.toLowerCase()
    return ['telefono', 'teléfono', 'celular', 'whatsapp', 'phone', 'mobile', 'movil', 'móvil']
      .some(token => normalizedKey.includes(token))
  })

  return phoneEntry ? String(phoneEntry[1] ?? '') : ''
}

async function sendWhatsapp() {
  if (!canSend.value || !template.value) return

  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const sanitizedPhone = sanitizePhoneNumber(telefono.value)

    const result = await MultichannelProvider.instance.sendWhatsappTemplate({
      destinatario: sanitizedPhone,
      template: template.value,
    })

    telefono.value = sanitizedPhone

    successMessage.value = result.status?.message || 'El mensaje se envió correctamente.'
  } catch (error: any) {
    console.error('Error sending WhatsApp template:', error)

    errorMessage.value =
      error?.response?.data?.status?.message ||
      error?.status?.message ||
      error?.message ||
      'No se pudo enviar el mensaje.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-dialog
    v-model="modelValue"
    max-width="760"
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

        <v-card-title class="d-flex align-center ga-2">
          <v-icon color="success" icon="mdi-whatsapp" />
          Enviar WhatsApp
        </v-card-title>

        <v-card-subtitle>
          Seleccioná un template y completá el teléfono para enviar el mensaje.
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="d-flex flex-column ga-5">
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
        >
          {{ successMessage }}
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
        >
          {{ errorMessage }}
        </v-alert>

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

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="telefono"
              label="Número de teléfono"
              placeholder="54911..."
              variant="outlined"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="template"
              :items="templates"
              label="Template"
              variant="outlined"
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
          Cerrar
        </v-btn>
        <v-btn
          color="success"
          :loading="loading"
          :disabled="!canSend"
          prepend-icon="mdi-whatsapp"
          @click="sendWhatsapp"
        >
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
