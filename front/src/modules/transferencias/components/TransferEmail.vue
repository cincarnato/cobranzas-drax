<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from "vue";
import {DraxImagePreview} from "@drax/common-vue";
import InboundEmailView from "@/modules/mail/components/InboundEmailView.vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {ITransferEmail} from "@/modules/transferencias/interfaces/ITransferEmail";
import InboundEmailProvider from "@/modules/mail/providers/InboundEmailProvider";
import TransferEmailProvider from "@/modules/transferencias/providers/TransferEmailProvider";

interface InboundAttachment {
  filename: string
  filepath: string
  size: number
  mimetype?: string
  url: string
}

const props = withDefaults(defineProps<{
  transferEmail: ITransferEmail
  readonly?: boolean
}>(), {
  readonly: false
})

const email = computed(() => props.transferEmail)
const ocrPanel = ref<number | null>(0)
const inboundEmailPanel = ref<number | null>(null)
const loadingInboundEmail = ref(false)
const linkedInboundEmail = ref<IInboundEmail | null>(null)
const inboundEmailError = ref('')
const savingMetadata = ref(false)
const metadataSaveError = ref('')
let metadataSaveTimeout: ReturnType<typeof setTimeout> | null = null

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

const inboundEmailId = computed(() => {
  const inboundEmail = email.value.inboundEmail
  if (!inboundEmail) return null
  if (typeof inboundEmail === 'string') return inboundEmail
  if (typeof inboundEmail === 'object' && '_id' in inboundEmail) {
    return typeof inboundEmail._id === 'string' ? inboundEmail._id : null
  }
  return null
})

const monthModel = computed({
  get: () => email.value.month || null,
  set: (value: string | null) => {
    if (props.readonly) return
    email.value.month = value || ''
    scheduleMetadataSave()
  }
})

const observationsModel = computed({
  get: () => email.value.observations || '',
  set: (value: string) => {
    if (props.readonly) return
    email.value.observations = value
    scheduleMetadataSave()
  }
})

const attachments = computed<InboundAttachment[]>(() =>
  (linkedInboundEmail.value?.attachments || []) as InboundAttachment[]
)

const proofAttachment = computed(() =>
  attachments.value.find((attachment) => attachment.mimetype?.startsWith('image/')) || attachments.value[0] || null
)

const attachmentsOcrText = computed(() => linkedInboundEmail.value?.attachmentsOcrText || '')
const firstAttachmentName = computed(() => proofAttachment.value?.filename || 'Sin archivo')
const isProofImage = computed(() => {
  const attachment = proofAttachment.value
  if (!attachment) return false
  const filename = attachment.filename?.toLowerCase() || ''
  const url = attachment.url?.toLowerCase() || ''
  return Boolean(
    attachment.mimetype?.startsWith('image/') ||
    /\.(png|jpe?g|webp|gif)$/.test(filename) ||
    /\.(png|jpe?g|webp|gif)(\?|#|$)/.test(url)
  )
})
const isProofPdf = computed(() => {
  const attachment = proofAttachment.value
  if (!attachment) return false
  const filename = attachment.filename?.toLowerCase() || ''
  const url = attachment.url?.toLowerCase() || ''
  return Boolean(
    attachment.mimetype === 'application/pdf' ||
    filename.endsWith('.pdf') ||
    /\.pdf(\?|#|$)/.test(url)
  )
})
const proofPdfPreviewUrl = computed(() => {
  const url = proofAttachment.value?.url
  if (!url) return ''
  return `${url}${url.includes('#') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=0&view=FitH`
})

watch(inboundEmailId, () => {
  linkedInboundEmail.value = null
  inboundEmailError.value = ''
  void fetchInboundEmail()
}, {immediate: true})

onBeforeUnmount(() => {
  if (metadataSaveTimeout) {
    clearTimeout(metadataSaveTimeout)
    metadataSaveTimeout = null
  }
})

function scheduleMetadataSave() {
  if (props.readonly || !email.value._id) return

  metadataSaveError.value = ''

  if (metadataSaveTimeout) {
    clearTimeout(metadataSaveTimeout)
  }

  metadataSaveTimeout = setTimeout(() => {
    metadataSaveTimeout = null
    void saveMetadata()
  }, 700)
}

async function saveMetadata() {
  if (props.readonly || !email.value._id) return

  savingMetadata.value = true
  metadataSaveError.value = ''

  try {
    const updated = await TransferEmailProvider.instance.updatePartial(email.value._id, {
      month: email.value.month || '',
      observations: email.value.observations || ''
    })

    email.value.month = updated.month || ''
    email.value.observations = updated.observations || ''
  } catch (error) {
    console.error('Error updating transfer email metadata:', error)
    metadataSaveError.value = 'No se pudieron guardar el mes y las observaciones.'
  } finally {
    savingMetadata.value = false
  }
}

async function fetchInboundEmail() {
  if (!inboundEmailId.value) return

  loadingInboundEmail.value = true
  inboundEmailError.value = ''

  try {
    linkedInboundEmail.value = await InboundEmailProvider.instance.findById(inboundEmailId.value)
  } catch (error) {
    console.error('Error fetching inbound email:', error)
    linkedInboundEmail.value = null
    inboundEmailError.value = 'No se pudo cargar el email vinculado.'
  } finally {
    loadingInboundEmail.value = false
  }
}

const formatCurrency = (amount?: number | null, currency?: string) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS'
  }).format(amount)
}

const formatDate = (date?: Date | string | null) => {
  if (!date) return '-'
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return '-'
  return parsedDate.toLocaleString('es-AR')
}

const valueOrDash = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}
</script>

<template>
  <div class="transfer-email-layout">
    <v-alert
      v-if="email.needsHumanReview"
      type="warning"
      variant="tonal"
      icon="mdi-alert"
      title="Revisión humana requerida"
      text="Este comprobante requiere atención manual por posibles inconsistencias o validaciones pendientes."
      class="mb-4"
    />

    <div class="transfer-email-grid">
      <section class="transfer-email-left">
        <v-card class="sketch-card summary-card" variant="flat">
          <div class="summary-block">
            <h3 class="summary-title">Datos del Afiliado</h3>
            <p><span class="summary-label">Nombre:</span> {{ valueOrDash(email.affiliateName) }}</p>
            <p><span class="summary-label">Email:</span> {{ valueOrDash(email.affiliateEmail) }}</p>
            <p><span class="summary-label">Documento:</span> {{ valueOrDash(email.affiliateDocumentNumber) }}</p>
          </div>

          <div class="summary-separator" />

          <div class="summary-block">
            <p><span class="summary-label">Monto Transferido:</span> {{ formatCurrency(email.amount, email.currency) }}</p>
            <p><span class="summary-label">Fecha de Transferencia:</span> {{ formatDate(email.transferDate) }}</p>
            <p><span class="summary-label">Número de Operación:</span> {{ valueOrDash(email.operationNumber) }}</p>
            <p><span class="summary-label">Concepto:</span> {{ valueOrDash(email.concept) }}</p>
          </div>

          <div class="summary-separator" />

          <div class="summary-block">
            <h3 class="summary-title">Cuenta Origen</h3>
            <p><span class="summary-label">Banco:</span> {{ valueOrDash(email.originBank) }}</p>
            <p><span class="summary-label">Cuenta:</span> {{ valueOrDash(email.originAccount) }}</p>
            <p><span class="summary-label">CBU/CVU:</span> {{ valueOrDash(email.originCbu) }}</p>
            <p><span class="summary-label">Alias:</span> {{ valueOrDash(email.originAlias) }}</p>
          </div>

          <div class="summary-separator" />

          <div class="summary-block">
            <h3 class="summary-title">Cuenta Destino</h3>
            <p><span class="summary-label">Banco:</span> {{ valueOrDash(email.destinationBank) }}</p>
            <p><span class="summary-label">Cuenta:</span> {{ valueOrDash(email.destinationAccount) }}</p>
            <p><span class="summary-label">CBU/CVU:</span> {{ valueOrDash(email.destinationCbu) }}</p>
            <p><span class="summary-label">Alias:</span> {{ valueOrDash(email.destinationAlias) }}</p>
          </div>
        </v-card>

        <v-select
          v-model="monthModel"
          :items="months"
          label="MES"
          placeholder="Seleccionar mes"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :readonly="readonly"
          class="sketch-input mt-3"
        />

        <v-textarea
          v-model="observationsModel"
          label="Observaciones"
          placeholder="Ingresar observaciones"
          variant="outlined"
          rows="6"
          auto-grow
          hide-details="auto"
          :readonly="readonly"
          class="sketch-input observations-input mt-3"
        />

        <div
          v-if="!readonly && (savingMetadata || metadataSaveError)"
          class="metadata-save-state"
          :class="{ 'metadata-save-state--error': metadataSaveError }"
        >
          <v-progress-circular
            v-if="savingMetadata"
            indeterminate
            size="14"
            width="2"
            class="mr-2"
          />
          {{ metadataSaveError || 'Guardando cambios...' }}
        </div>
      </section>

      <section class="transfer-email-right">
        <v-card class="sketch-card proof-card" variant="flat">
          <div class="proof-title">Comprobante</div>

          <v-skeleton-loader
            v-if="loadingInboundEmail"
            type="image, article"
            class="proof-loader"
          />

          <v-alert
            v-else-if="inboundEmailError"
            type="error"
            variant="tonal"
            class="ma-4"
          >
            {{ inboundEmailError }}
          </v-alert>

          <div v-else-if="proofAttachment" class="proof-preview">
            <a
              v-if="isProofImage"
              :href="proofAttachment.url"
              target="_blank"
              rel="noopener noreferrer"
              class="proof-image-link"
              :title="`Abrir ${firstAttachmentName}`"
            >
              <v-img
                :src="proofAttachment.url"
                :alt="firstAttachmentName"
                cover
                class="proof-image"
              />
            </a>
            <div v-else-if="isProofPdf" class="proof-pdf-preview">
              <iframe
                :src="proofPdfPreviewUrl"
                :title="firstAttachmentName"
                class="proof-pdf-frame"
              />
              <a
                :href="proofAttachment.url"
                target="_blank"
                rel="noopener noreferrer"
                class="proof-open-link"
              >
                Abrir PDF
              </a>
            </div>
            <DraxImagePreview v-else :image="proofAttachment" />
            <div class="proof-filename">{{ firstAttachmentName }}</div>
          </div>

          <div v-else class="proof-empty">
            <v-icon icon="mdi-file-image-outline" size="42" />
            <span>No hay comprobante adjunto para mostrar.</span>
          </div>
        </v-card>

        <v-card class="sketch-card ocr-card mt-4" variant="flat">
          <v-expansion-panels v-model="ocrPanel" variant="accordion" flat>
            <v-expansion-panel>
              <v-expansion-panel-title class="ocr-title">
                Texto OCR Extraído
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div v-if="attachmentsOcrText" class="ocr-text">
                  {{ attachmentsOcrText }}
                </div>
                <div v-else class="ocr-empty">
                  No hay texto OCR extraído de adjuntos.
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </section>
    </div>

    <v-expansion-panels
      v-if="inboundEmailId"
      v-model="inboundEmailPanel"
      variant="accordion"
      class="original-email-panel"
    >
      <v-expansion-panel rounded="lg">
        <v-expansion-panel-title class="original-email-title">
          <v-icon icon="mdi-email-outline" class="mr-2" />
          Email original
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-skeleton-loader
            v-if="loadingInboundEmail"
            type="article"
          />

          <v-alert
            v-else-if="inboundEmailError"
            type="error"
            variant="tonal"
            class="mb-2"
          >
            {{ inboundEmailError }}
          </v-alert>

          <InboundEmailView
            v-else-if="linkedInboundEmail"
            :inbound-email="linkedInboundEmail"
          />

          <v-alert
            v-else
            type="info"
            variant="tonal"
          >
            No hay email original para mostrar.
          </v-alert>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<style scoped>
.transfer-email-layout {
  --transfer-border: rgba(var(--v-theme-on-surface), 0.42);
  --transfer-muted: rgba(var(--v-theme-on-surface), 0.68);
  --transfer-preview-surface: rgb(var(--v-theme-surface-variant));
}

.transfer-email-grid {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(320px, 1fr);
  gap: 32px 46px;
  align-items: start;
}

.transfer-email-left,
.transfer-email-right {
  min-width: 0;
}

.sketch-card {
  border: 2px solid var(--transfer-border);
  border-radius: 24px;
  box-shadow: none;
}

.summary-card {
  padding: 22px 26px;
}

.summary-block h3,
.summary-block p {
  margin: 0;
  line-height: 1.45;
}

.summary-block h3 {
  font-size: 1rem;
  font-weight: 700;
}

.summary-title {
  display: inline-block;
  padding: 2px 8px 2px 10px;
  border-left: 4px solid rgb(var(--v-theme-primary));
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-primary), 0));
  color: rgb(var(--v-theme-primary));
}

.summary-block p {
  font-size: 0.98rem;
}

.summary-label {
  font-weight: 700;
}

.summary-separator {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.18);
  margin: 10px 0;
}

.metadata-save-state {
  display: flex;
  align-items: center;
  min-height: 20px;
  margin-top: 6px;
  color: var(--transfer-muted);
  font-size: 0.78rem;
}

.metadata-save-state--error {
  color: rgb(var(--v-theme-error));
}

.sketch-input :deep(.v-field__outline) {
  --v-field-border-width: 2px;
  --v-field-border-opacity: 0.42;
}

.observations-input :deep(textarea) {
  min-height: 126px;
}

.proof-card {
  min-height: 620px;
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
}

.proof-title,
.ocr-title {
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.proof-title {
  padding: 0 0 6px;
}

.proof-preview {
  min-height: 565px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.proof-image-link {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 535px;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
  background: var(--transfer-preview-surface);
}

.proof-image {
  width: 100%;
  height: 100%;
}

.proof-image :deep(.v-img__img) {
  object-position: left top;
}

.proof-pdf-preview {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 535px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
  background: var(--transfer-preview-surface);
}

.proof-pdf-frame {
  width: 100%;
  height: 100%;
  min-height: 535px;
  border: 0;
}

.proof-open-link {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(var(--v-theme-on-surface), 0.18);
}

.proof-preview :deep(.drax-image-preview) {
  width: 100%;
  height: 535px;
}

.proof-filename {
  margin-top: 4px;
  color: var(--transfer-muted);
  font-size: 0.78rem;
}

.proof-empty,
.ocr-empty {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  color: var(--transfer-muted);
  text-align: center;
}

.proof-loader {
  margin-top: 24px;
}

.ocr-card {
  overflow: hidden;
}

.ocr-card :deep(.v-expansion-panel) {
  background: transparent;
}

.ocr-card :deep(.v-expansion-panel-title) {
  min-height: 40px;
  border-bottom: 2px solid var(--transfer-border);
}

.ocr-card :deep(.v-expansion-panel-text__wrapper) {
  padding: 18px 22px 22px;
}

.ocr-text {
  white-space: pre-wrap;
  max-height: 330px;
  overflow: auto;
  font-size: 0.95rem;
  line-height: 1.35;
}

.original-email-panel {
  margin-top: 24px;
}

.original-email-title {
  font-weight: 700;
}

@media (max-width: 900px) {
  .transfer-email-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .proof-card {
    min-height: 520px;
  }

  .proof-preview {
    min-height: 465px;
  }

  .proof-image-link,
  .proof-pdf-preview,
  .proof-pdf-frame,
  .proof-preview :deep(.drax-image-preview) {
    min-height: 435px;
    height: 435px;
  }
}
</style>
