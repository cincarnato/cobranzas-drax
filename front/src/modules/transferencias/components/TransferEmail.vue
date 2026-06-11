<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {DraxImagePreview} from "@drax/common-vue";
import InboundEmailView from "@/modules/mail/components/InboundEmailView.vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {
  ITransferEmail,
  ITransferEmailAdditionalAffiliate
} from "@/modules/transferencias/interfaces/ITransferEmail";
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
const emit = defineEmits<{
  saved: [transferEmail: ITransferEmail]
}>()

type TransferEmailPartialForm = Pick<
  ITransferEmail,
  | 'affiliateName'
  | 'affiliateEmail'
  | 'affiliateDocumentNumber'
  | 'amount'
  | 'additionalAffiliates'
  | 'month'
  | 'observations'
>

const email = computed(() => props.transferEmail)
const detailsPanels = ref<number[]>([0, 1])
const additionalAffiliatesPanel = ref<number | null>(null)
const ocrPanel = ref<number | null>(0)
const inboundEmailPanel = ref<number | null>(null)
const loadingInboundEmail = ref(false)
const linkedInboundEmail = ref<IInboundEmail | null>(null)
const inboundEmailError = ref('')
const savingMetadata = ref(false)
const metadataSaveError = ref('')
const metadataSaveSuccess = ref('')
const partialForm = reactive<Required<TransferEmailPartialForm>>({
  affiliateName: '',
  affiliateEmail: '',
  affiliateDocumentNumber: '',
  amount: 0,
  additionalAffiliates: [],
  month: '',
  observations: ''
})

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

watch(() => props.transferEmail._id, syncPartialForm, {immediate: true})

function syncPartialForm() {
  partialForm.affiliateName = email.value.affiliateName || ''
  partialForm.affiliateEmail = email.value.affiliateEmail || ''
  partialForm.affiliateDocumentNumber = email.value.affiliateDocumentNumber || ''
  partialForm.amount = email.value.amount || 0
  partialForm.additionalAffiliates = cloneAdditionalAffiliates(email.value.additionalAffiliates || [])
  partialForm.month = email.value.month || ''
  partialForm.observations = email.value.observations || ''
  metadataSaveError.value = ''
  metadataSaveSuccess.value = ''
}

function cloneAdditionalAffiliates(affiliates: ITransferEmailAdditionalAffiliate[]) {
  return affiliates.map((affiliate) => ({
    name: affiliate.name || '',
    email: affiliate.email || '',
    documentNumber: affiliate.documentNumber || ''
  }))
}

function addAdditionalAffiliate() {
  partialForm.additionalAffiliates.push({
    name: '',
    email: '',
    documentNumber: ''
  })
}

function removeAdditionalAffiliate(index: number) {
  partialForm.additionalAffiliates.splice(index, 1)
}

function buildAdditionalAffiliatesPayload() {
  return partialForm.additionalAffiliates
    .map((affiliate) => ({
      name: affiliate.name?.trim() || '',
      email: affiliate.email?.trim() || '',
      documentNumber: affiliate.documentNumber?.trim() || ''
    }))
    .filter((affiliate) => affiliate.name || affiliate.email || affiliate.documentNumber)
}

async function saveMetadata() {
  if (props.readonly || !email.value._id) return

  savingMetadata.value = true
  metadataSaveError.value = ''
  metadataSaveSuccess.value = ''

  try {
    const updated = await TransferEmailProvider.instance.updatePartial(email.value._id, {
      affiliateName: partialForm.affiliateName || '',
      affiliateEmail: partialForm.affiliateEmail || '',
      affiliateDocumentNumber: partialForm.affiliateDocumentNumber || '',
      amount: partialForm.amount || 0,
      additionalAffiliates: buildAdditionalAffiliatesPayload(),
      month: partialForm.month || '',
      observations: partialForm.observations || ''
    })

    email.value.affiliateName = updated.affiliateName || ''
    email.value.affiliateEmail = updated.affiliateEmail || ''
    email.value.affiliateDocumentNumber = updated.affiliateDocumentNumber || ''
    email.value.amount = updated.amount || 0
    email.value.additionalAffiliates = cloneAdditionalAffiliates(updated.additionalAffiliates || [])
    email.value.month = updated.month || ''
    email.value.observations = updated.observations || ''
    email.value.needsHumanReview = Boolean(updated.needsHumanReview)
    syncPartialForm()
    emit('saved', updated)
    metadataSaveSuccess.value = 'Cambios guardados.'
  } catch (error) {
    console.error('Error updating transfer email metadata:', error)
    metadataSaveError.value = 'No se pudieron guardar los cambios.'
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
        <v-expansion-panels
          v-model="detailsPanels"
          multiple
          variant="accordion"
          class="detail-panels"
        >
          <v-expansion-panel class="sketch-card detail-panel" rounded="lg">
            <v-expansion-panel-title class="detail-panel-title">
              Email
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="summary-block">
                <p>
                  <span class="summary-label mail-message-id-label">ID Mail:</span>
                  <span class="mail-message-id" :title="valueOrDash(email.emailMessageId)">
                    {{ valueOrDash(email.emailMessageId) }}
                  </span>
                </p>
                <p><span class="summary-label">Fecha Email:</span> {{ formatDate(email.emailDate) }}</p>
                <p><span class="summary-label">Asunto:</span> {{ valueOrDash(email.emailSubject) }}</p>
                <p><span class="summary-label">Remitente:</span> {{ valueOrDash(email.emailFromName) }}</p>
                <p><span class="summary-label">Email Remitente:</span> {{ valueOrDash(email.emailFromEmail) }}</p>
                <p><span class="summary-label">Documento Email:</span> {{ valueOrDash(email.emailDocumentNumber) }}</p>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel class="sketch-card detail-panel" rounded="lg">
            <v-expansion-panel-title class="detail-panel-title">
              Comprobante
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="summary-block">
                <p><span class="summary-label">Monto Transferido:</span> {{ formatCurrency(email.amount, email.currency) }}</p>
                <p><span class="summary-label">Fecha de Transferencia:</span> {{ formatDate(email.transferDate) }}</p>
                <p><span class="summary-label">Número de Operación:</span> {{ valueOrDash(email.operationNumber) }}</p>
                <p><span class="summary-label">Concepto:</span> {{ valueOrDash(email.concept) }}</p>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel class="sketch-card detail-panel" rounded="lg">
            <v-expansion-panel-title class="detail-panel-title">
              Origen
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="summary-block">
                <p><span class="summary-label">Cuenta:</span> {{ valueOrDash(email.originAccount) }}</p>
                <p><span class="summary-label">CBU/CVU:</span> {{ valueOrDash(email.originCbu) }}</p>
                <p><span class="summary-label">Alias:</span> {{ valueOrDash(email.originAlias) }}</p>
                <p><span class="summary-label">Banco:</span> {{ valueOrDash(email.originBank) }}</p>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel class="sketch-card detail-panel" rounded="lg">
            <v-expansion-panel-title class="detail-panel-title">
              Destino
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="summary-block">
                <p><span class="summary-label">Cuenta:</span> {{ valueOrDash(email.destinationAccount) }}</p>
                <p><span class="summary-label">CBU/CVU:</span> {{ valueOrDash(email.destinationCbu) }}</p>
                <p><span class="summary-label">Alias:</span> {{ valueOrDash(email.destinationAlias) }}</p>
                <p><span class="summary-label">Banco:</span> {{ valueOrDash(email.destinationBank) }}</p>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-card class="sketch-card partial-form-card" variant="flat">
          <div class="partial-form-header">
            <div class="partial-form-title">Actualizar registro</div>
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="affiliate-strategy-chip"
            >
              Estrategia Afiliado:
              <strong class="affiliate-strategy-value">{{ valueOrDash(email.affiliateStrategy) }}</strong>
            </v-chip>
          </div>

          <v-text-field
            v-model="partialForm.affiliateName"
            label="Nombre Afiliado"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :readonly="readonly"
            class="sketch-input"
          />

          <v-text-field
            v-model="partialForm.affiliateEmail"
            label="Email Afiliado"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :readonly="readonly"
            class="sketch-input mt-3"
          />

          <v-text-field
            v-model="partialForm.affiliateDocumentNumber"
            label="Documento Afiliado"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :readonly="readonly"
            class="sketch-input mt-3"
          />

          <v-text-field
            v-model.number="partialForm.amount"
            label="Monto"
            type="number"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :readonly="readonly"
            class="sketch-input mt-3"
          />

          <v-select
            v-model="partialForm.month"
            :items="months"
            label="MES"
            placeholder="Seleccionar mes"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :readonly="readonly"
            clearable
            class="sketch-input mt-3"
          />

          <v-text-field
            v-model="partialForm.observations"
            label="Observaciones"
            placeholder="Ingresar observaciones"
            variant="outlined"
            density="compact"
            auto-grow
            hide-details="auto"
            :readonly="readonly"
            class="sketch-input observations-input mt-3"
          />

          <v-expansion-panels
            v-model="additionalAffiliatesPanel"
            variant="accordion"
            class="additional-affiliates-panel"
          >
            <v-expansion-panel class="additional-affiliates-card" rounded="lg">
              <v-expansion-panel-title class="additional-affiliates-title">
                Afiliados adicionales
                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="teal"
                  class="ml-2"
                >
                  {{ partialForm.additionalAffiliates.length }}
                </v-chip>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div
                  v-for="(affiliate, index) in partialForm.additionalAffiliates"
                  :key="index"
                  class="additional-affiliate-row"
                >
                  <v-text-field
                    v-model="affiliate.name"
                    label="Nombre"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :readonly="readonly"
                    class="sketch-input"
                  />

                  <v-text-field
                    v-model="affiliate.email"
                    label="Email"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :readonly="readonly"
                    class="sketch-input"
                  />

                  <v-text-field
                    v-model="affiliate.documentNumber"
                    label="Documento"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :readonly="readonly"
                    class="sketch-input"
                  />

                  <v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    :disabled="readonly"
                    @click="removeAdditionalAffiliate(index)"
                  />
                </div>

                <div
                  v-if="!partialForm.additionalAffiliates.length"
                  class="additional-affiliates-empty"
                >
                  No hay afiliados adicionales cargados.
                </div>

                <v-btn
                  color="teal"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-plus"
                  :disabled="readonly"
                  class="mt-2"
                  @click="addAdditionalAffiliate"
                >
                  Agregar afiliado
                </v-btn>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <div class="partial-form-actions">
            <v-btn
              color="primary"
              variant="flat"
              :loading="savingMetadata"
              :disabled="readonly || !email._id"
              @click="saveMetadata"
            >
              Actualizar
            </v-btn>
          </div>

          <div
            v-if="!readonly && (savingMetadata || metadataSaveError || metadataSaveSuccess)"
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
            {{ metadataSaveError || metadataSaveSuccess || 'Guardando cambios...' }}
          </div>
        </v-card>
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
  width: 100%;
}

.sketch-card {
  border: 2px solid var(--transfer-border);
  border-radius: 10px;
  box-shadow: none;
  width: 100%;
}

.detail-panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  width: 100%;
}

.detail-panel {
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.detail-panel + .detail-panel {
  margin-top: -2px;
}

.detail-panel :deep(.v-expansion-panel-title) {
  min-height: 34px;
  padding: 6px 14px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.14);
}

.detail-panel :deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 14px 10px;
}

.detail-panel-title,
.partial-form-title {
  font-weight: 700;
  letter-spacing: 0.01em;
}

.partial-form-card {
  padding: 12px 14px;
  margin-top: 12px;
}

.partial-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  min-width: 0;
}

.partial-form-title {
  min-width: 0;
}

.partial-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.affiliate-strategy-chip {
  flex: 0 0 auto;
  font-size: 0.88rem;
}

.affiliate-strategy-value {
  margin-left: 4px;
}

.summary-block p {
  margin: 0;
  line-height: 1.28;
  font-size: 0.88rem;
}

.summary-label {
  font-weight: 700;
}

.mail-message-id {
  display: inline-block;
  max-width: calc(100% - 43px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  font-family: monospace;
  font-size: 0.66rem;
  line-height: 1;
}

.mail-message-id-label {
  display: inline-block;
  font-size: 0.66rem;
  line-height: 1;
  vertical-align: bottom;
}

.additional-affiliates-panel {
  margin-top: 12px;
}

.additional-affiliates-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.22);
  background: rgba(var(--v-theme-surface-variant), 0.28);
}

.additional-affiliates-card :deep(.v-expansion-panel-title) {
  min-height: 34px;
  padding: 6px 10px;
}

.additional-affiliates-card :deep(.v-expansion-panel-text__wrapper) {
  padding: 10px;
}

.additional-affiliates-title {
  font-size: 0.88rem;
  font-weight: 700;
}

.additional-affiliate-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.85fr) auto;
  gap: 8px;
  align-items: start;
}

.additional-affiliate-row + .additional-affiliate-row {
  margin-top: 8px;
}

.additional-affiliates-empty {
  color: var(--transfer-muted);
  font-size: 0.82rem;
}

.metadata-save-state {
  display: flex;
  align-items: center;
  min-height: 20px;
  margin-top: 4px;
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
  min-height: 88px;
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

  .additional-affiliate-row {
    grid-template-columns: 1fr;
  }
}
</style>
