<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {DraxImagePreview} from "@drax/common-vue";
import {CrudCreateOnTheFlyButton} from "@drax/crud-vue";
import {VDateInput} from 'vuetify/labs/VDateInput'
import InboundEmailView from "@/modules/mail/components/InboundEmailView.vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {
  ITransferEmail,
  ITransferEmailAffiliate,
  TransferEmailHumanStatus
} from "@/modules/transferencias/interfaces/ITransferEmail";
import InboundEmailProvider from "@/modules/mail/providers/InboundEmailProvider";
import TransferEmailProvider from "@/modules/transferencias/providers/TransferEmailProvider";
import TransferEmailReprocessAction from "@/modules/transferencias/components/TransferEmailReprocessAction.vue";
import type {TransferEmailReprocessResult} from "@/modules/transferencias/providers/TransferEmailProvider";
import PayerCrud from "@/modules/transferencias/cruds/PayerCrud";

interface InboundAttachment {
  filename: string
  filepath: string
  size: number
  mimetype?: string
  url: string
}

const props = withDefaults(defineProps<{
  transferEmail: ITransferEmail
  auditSessionId?: string | null
  readonly?: boolean
}>(), {
  auditSessionId: null,
  readonly: false
})
const emit = defineEmits<{
  saved: [transferEmail: ITransferEmail]
  validated: [transferEmail: ITransferEmail]
  corrected: [transferEmail: ITransferEmail]
  discarded: [transferEmail: ITransferEmail]
  reprocessed: [result: TransferEmailReprocessResult]
  close: []
  'dirty-change': [isDirty: boolean]
}>()

type TransferEmailPartialForm = Pick<
  ITransferEmail,
  | 'amount'
  | 'affiliates'
  | 'humanStatus'
  | 'transferDate'
>

const email = computed(() => props.transferEmail)
const activeLeftTab = ref('proof')
const detailsPanels = ref<number[]>([2])
const affiliatesPanel = ref<number | null>(0)
const loadingInboundEmail = ref(false)
const linkedInboundEmail = ref<IInboundEmail | null>(null)
const inboundEmailError = ref('')
const savingMetadata = ref(false)
const metadataSaveError = ref('')
const metadataSaveSuccess = ref('')
const closeInboundEmail = ref(true)
const partialForm = reactive<Required<TransferEmailPartialForm>>({
  amount: 0,
  affiliates: [],
  humanStatus: 'VALIDADO',
  transferDate: null
})

const humanStatusOptions: Array<{title: string; value: TransferEmailHumanStatus; color: string}> = [
  {title: 'Validado', value: 'VALIDADO', color: 'success'},
  {title: 'Corregido', value: 'CORREGIDO', color: 'info'},
  {title: 'Descartado', value: 'DESCARTADO', color: 'error'}
]

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
const inboundEmailManagementUrl = computed(() =>
  inboundEmailId.value ? `/mail/management?inboundEmail=${encodeURIComponent(inboundEmailId.value)}` : ''
)

const attachments = computed<InboundAttachment[]>(() =>
  (linkedInboundEmail.value?.attachments || []) as InboundAttachment[]
)

const proofAttachment = computed(() =>
  attachments.value.find((attachment) => attachment.mimetype?.startsWith('image/')) || attachments.value[0] || null
)

const attachmentsOcrText = computed(() => linkedInboundEmail.value?.attachmentsOcrText || '')
const firstAttachmentName = computed(() => proofAttachment.value?.filename || 'Sin archivo')
const showHumanReviewAlert = computed(() =>
  email.value.status === 'PENDIENTE_AUDITORIA' || Boolean(email.value.needsHumanReview)
)
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

const argentinaDateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const isDirty = computed(() => {
  if (!email.value?._id) return false
  return JSON.stringify({
    amount: partialForm.amount || 0,
    affiliates: buildAffiliatesPayload(),
    humanStatus: partialForm.humanStatus,
    transferDate: normalizeDate(partialForm.transferDate)
  }) !== JSON.stringify({
    amount: email.value.amount || 0,
    affiliates: cloneAffiliates(email.value.affiliates || []),
    humanStatus: resolveInitialHumanStatus(email.value.humanStatus),
    transferDate: normalizeDate(email.value.transferDate)
  })
})

watch(inboundEmailId, () => {
  linkedInboundEmail.value = null
  inboundEmailError.value = ''
  void fetchInboundEmail()
}, {immediate: true})

watch(() => props.transferEmail._id, syncPartialForm, {immediate: true})
watch(() => partialForm.amount, syncSingleAffiliateAmount)
watch(() => partialForm.affiliates.length, syncSingleAffiliateAmount)
watch(isDirty, (value) => emit('dirty-change', value), {immediate: true})

function syncPartialForm() {
  partialForm.amount = email.value.amount || 0
  partialForm.affiliates = cloneAffiliates(email.value.affiliates || [])
  partialForm.humanStatus = resolveInitialHumanStatus(email.value.humanStatus)
  partialForm.transferDate = email.value.transferDate ? new Date(email.value.transferDate) : null
  closeInboundEmail.value = true
  syncSingleAffiliateAmount()
  metadataSaveError.value = ''
  metadataSaveSuccess.value = ''
}

function resolveInitialHumanStatus(humanStatus?: ITransferEmail['humanStatus']) {
  if (humanStatus === 'VALIDADO' || humanStatus === 'CORREGIDO' || humanStatus === 'DESCARTADO') {
    return humanStatus
  }

  return 'VALIDADO'
}

function cloneAffiliates(affiliates: ITransferEmailAffiliate[]) {
  const legacyTransferEmail = email.value as ITransferEmail & { month?: string; observations?: string }

  return affiliates.map((affiliate, index) => ({
    name: affiliate.name || '',
    email: affiliate.email || '',
    amount: affiliate.amount || 0,
    documentNumber: affiliate.documentNumber || '',
    month: affiliate.month || (affiliates.length === 1 && index === 0 ? legacyTransferEmail.month || '' : ''),
    observations: affiliate.observations || (affiliates.length === 1 && index === 0 ? legacyTransferEmail.observations || '' : '')
  }))
}

function addAffiliate() {
  partialForm.affiliates.push({
    name: '',
    email: '',
    amount: 0,
    documentNumber: '',
    month: '',
    observations: ''
  })
  syncSingleAffiliateAmount()
}

function removeAffiliate(index: number) {
  partialForm.affiliates.splice(index, 1)
  syncSingleAffiliateAmount()
}

function syncSingleAffiliateAmount() {
  if (partialForm.affiliates.length === 1) {
    partialForm.affiliates[0].amount = partialForm.amount || 0
  }
}

function buildAffiliatesPayload() {
  const isSingleAffiliate = partialForm.affiliates.length === 1

  return partialForm.affiliates
    .map((affiliate) => ({
      name: affiliate.name?.trim() || '',
      email: affiliate.email?.trim() || '',
      amount: isSingleAffiliate ? partialForm.amount || 0 : affiliate.amount || 0,
      documentNumber: affiliate.documentNumber?.trim() || '',
      month: affiliate.month?.trim() || '',
      observations: affiliate.observations?.trim() || ''
    }))
    .filter((affiliate) => affiliate.name || affiliate.email || affiliate.amount || affiliate.documentNumber || affiliate.month || affiliate.observations)
}

function setHumanStatus(humanStatus: Required<TransferEmailPartialForm>['humanStatus']) {
  partialForm.humanStatus = humanStatus
}

function normalizeDate(date?: Date | string | null) {
  if (!date) return null
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

async function saveMetadata() {
  if (props.readonly || !email.value._id) return

  savingMetadata.value = true
  metadataSaveError.value = ''
  metadataSaveSuccess.value = ''

  try {
    const updated = await TransferEmailProvider.instance.audit(email.value._id, {
      amount: partialForm.amount || 0,
      affiliates: buildAffiliatesPayload(),
      humanStatus: partialForm.humanStatus,
      transferDate: partialForm.transferDate,
      auditSessionId: props.auditSessionId,
      closeInboundEmail: closeInboundEmail.value
    })

    email.value.amount = updated.amount || 0
    email.value.affiliates = cloneAffiliates(updated.affiliates || [])
    email.value.transferDate = updated.transferDate
    email.value.aiStatus = updated.aiStatus
    email.value.aiProcessedAt = updated.aiProcessedAt
    email.value.aiError = updated.aiError
    email.value.humanStatus = updated.humanStatus
    email.value.assignedTo = updated.assignedTo
    email.value.auditedBy = updated.auditedBy
    email.value.auditedAt = updated.auditedAt
    email.value.status = updated.status
    email.value.needsHumanReview = Boolean(updated.needsHumanReview)
    syncPartialForm()
    emit('saved', updated)
    if (updated.humanStatus === 'VALIDADO') emit('validated', updated)
    if (updated.humanStatus === 'CORREGIDO') emit('corrected', updated)
    if (updated.humanStatus === 'DESCARTADO') emit('discarded', updated)
    metadataSaveSuccess.value = 'Cambios guardados.'
  } catch (error) {
    console.error('Error updating transfer email metadata:', error)
    metadataSaveError.value = 'No se pudieron guardar los cambios.'
  } finally {
    savingMetadata.value = false
  }
}

function refreshAfterReprocess(result: TransferEmailReprocessResult) {
  Object.assign(email.value, result.updatedFields, result.transferEmail)
  syncPartialForm()
  emit('reprocessed', result)
}

defineExpose({
  saveMetadata
})

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
  return argentinaDateTimeFormatter.format(parsedDate)
}

const valueOrDash = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

const payerId = computed(() => {
  const payer = email.value.payer
  if (!payer) return ''
  if (typeof payer === 'string') return payer
  return payer._id || ''
})

const payerLabel = computed(() => {
  const payer = email.value.payer
  if (!payer) return ''
  if (typeof payer === 'string') return payer
  return [payer.strategy, payer.value].filter(Boolean).join(' / ') || payer._id || ''
})

const statusPresentation = (status?: string) => {
  switch (status) {
    case 'PENDIENTE_IA':
      return {label: 'Pendiente IA', color: 'grey', icon: 'mdi-progress-clock'}
    case 'PENDIENTE_AUDITORIA':
      return {label: 'Pendiente auditoría', color: 'warning', icon: 'mdi-account-search-outline'}
    case 'AUDITADO':
      return {label: 'Auditado', color: 'success', icon: 'mdi-check-decagram-outline'}
    default:
      return {label: valueOrDash(status), color: 'grey', icon: 'mdi-help-circle-outline'}
  }
}

const aiStatusPresentation = (status?: string) => {
  switch (status) {
    case 'PENDIENTE':
      return {label: 'Pendiente', color: 'grey', icon: 'mdi-progress-clock'}
    case 'PROCESADO_CONFIABLE':
      return {label: 'Procesado confiable', color: 'success', icon: 'mdi-robot-happy-outline'}
    case 'PROCESADO_CON_DUDAS':
      return {label: 'Procesado con dudas', color: 'warning', icon: 'mdi-robot-confused-outline'}
    case 'PROCESADO_INCOMPLETO':
      return {label: 'Procesado incompleto', color: 'deep-orange', icon: 'mdi-robot-dead-outline'}
    case 'PROCESADO_SIN_IA':
      return {label: 'Fallback sin IA', color: 'warning', icon: 'mdi-text-search'}
    case 'ERROR_PROCESAMIENTO':
      return {label: 'Error de procesamiento', color: 'error', icon: 'mdi-robot-angry-outline'}
    default:
      return {label: valueOrDash(status), color: 'grey', icon: 'mdi-help-circle-outline'}
  }
}

const humanStatusPresentation = (status?: string) => {
  switch (status) {
    case 'PENDIENTE':
      return {label: 'Pendiente', color: 'grey', icon: 'mdi-progress-clock'}
    case 'VALIDADO':
      return {label: 'Validado', color: 'success', icon: 'mdi-check-circle-outline'}
    case 'CORREGIDO':
      return {label: 'Corregido', color: 'info', icon: 'mdi-pencil-circle-outline'}
    case 'DESCARTADO':
      return {label: 'Descartado', color: 'error', icon: 'mdi-close-circle-outline'}
    default:
      return {label: valueOrDash(status), color: 'grey', icon: 'mdi-help-circle-outline'}
  }
}
</script>

<template>
  <div class="transfer-email-layout">
  <div class="status-overview">
    <v-chip
      :color="statusPresentation(email.status).color"
      :prepend-icon="statusPresentation(email.status).icon"
      variant="flat"
      size="small"
    >
      {{ statusPresentation(email.status).label }}
    </v-chip>
    <v-chip
      :color="aiStatusPresentation(email.aiStatus).color"
      :prepend-icon="aiStatusPresentation(email.aiStatus).icon"
      variant="tonal"
      size="small"
    >
      IA: {{ aiStatusPresentation(email.aiStatus).label }}
    </v-chip>
    <v-chip
      :color="humanStatusPresentation(email.humanStatus).color"
      :prepend-icon="humanStatusPresentation(email.humanStatus).icon"
      variant="tonal"
      size="small"
    >
      Auditoría: {{ humanStatusPresentation(email.humanStatus).label }}
    </v-chip>
    <v-chip
      v-if="email.auditedBy"
      color="primary"
      prepend-icon="mdi-account-check-outline"
      variant="tonal"
      size="small"
    >
      {{ valueOrDash(email.auditedBy?.username || email.auditedBy?.name) }}
    </v-chip>
    <v-chip
      v-if="email.auditedAt"
      color="primary"
      prepend-icon="mdi-calendar-check-outline"
      variant="tonal"
      size="small"
    >
      {{ formatDate(email.auditedAt) }}
    </v-chip>
    <v-chip
      v-if="email._id"
      color="blue-grey"
      prepend-icon="mdi-identifier"
      variant="tonal"
      size="small"
      class="transfer-id-chip"
    >
      ID: {{ email._id }}
    </v-chip>
    <v-chip
      v-if="showHumanReviewAlert"
      color="warning"
      prepend-icon="mdi-alert"
      variant="tonal"
      size="small"
    >
      Revisión humana requerida
    </v-chip>
    <v-chip
      v-if="payerLabel"
      color="teal"
      prepend-icon="mdi-account-cash-outline"
      variant="tonal"
      size="small"
    >
      Pagador: {{ payerLabel }}
    </v-chip>

    <v-spacer></v-spacer>
    <crud-create-on-the-fly-button :entity="PayerCrud.instance" label="pagador"></crud-create-on-the-fly-button>


    <transfer-email-reprocess-action
      :item="email"
      size="default"
      label="Reprocesar IA"
      @reprocessed="refreshAfterReprocess"
    />

  </div>

  <v-row class="align-start">
    <v-col cols="12" md="5" lg="4">
      <v-card class="sketch-card left-tabs-card" variant="flat">
        <v-tabs
          v-model="activeLeftTab"
          color="primary"
          density="compact"
          grow
          class="left-tabs"
        >
          <v-tab value="proof" prepend-icon="mdi-file-document-outline">
            Comprobante
          </v-tab>
          <v-tab value="ocr" prepend-icon="mdi-ocr">
            OCR
          </v-tab>
          <v-tab value="email" prepend-icon="mdi-email-outline">
            Mail
          </v-tab>
        </v-tabs>

        <v-window v-model="activeLeftTab" class="left-tab-window">
          <v-window-item value="proof">
            <div class="left-tab-content proof-tab-content">
              <v-skeleton-loader
                v-if="loadingInboundEmail"
                type="image, article"
                class="proof-loader"
              />

              <v-alert
                v-else-if="inboundEmailError"
                type="error"
                variant="tonal"
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
                <DraxImagePreview v-else :image="proofAttachment"/>
                <div class="proof-filename">{{ firstAttachmentName }}</div>
              </div>

              <div v-else class="proof-empty">
                <v-icon icon="mdi-file-image-outline" size="42"/>
                <span>No hay comprobante adjunto para mostrar.</span>
              </div>
            </div>
          </v-window-item>

          <v-window-item value="ocr">
            <div class="left-tab-content ocr-tab-content">
              <div v-if="attachmentsOcrText" class="ocr-text">
                {{ attachmentsOcrText }}
              </div>
              <div v-else class="ocr-empty">
                No hay texto OCR extraído de adjuntos.
              </div>
            </div>
          </v-window-item>

          <v-window-item value="email">
            <div class="left-tab-content email-tab-content">
              <v-skeleton-loader
                v-if="loadingInboundEmail"
                type="article"
              />

              <v-alert
                v-else-if="inboundEmailError"
                type="error"
                variant="tonal"
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
            </div>
          </v-window-item>
        </v-window>
      </v-card>
    </v-col>

    <v-col cols="12" md="7" lg="8">
      <v-expansion-panels
        v-model="detailsPanels"
        multiple
        variant="accordion"
        class="detail-panels"
      >
        <v-expansion-panel class="sketch-card detail-panel" rounded="lg">
          <v-expansion-panel-title class="detail-panel-title">
            Estado
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="summary-block">
              <p><span class="summary-label">Estado general:</span> {{ statusPresentation(email.status).label }}</p>
              <p><span class="summary-label">Estado IA:</span> {{ aiStatusPresentation(email.aiStatus).label }}</p>
              <p><span class="summary-label">Pagador mapeado:</span> {{ valueOrDash(payerLabel) }}</p>
              <p><span class="summary-label">ID Payer:</span> {{ valueOrDash(payerId) }}</p>
              <p><span class="summary-label">Fecha Procesado IA:</span> {{ formatDate(email.aiProcessedAt) }}</p>
              <p><span class="summary-label">Error IA:</span> {{ valueOrDash(email.aiError) }}</p>
              <v-divider></v-divider>
              <p><span class="summary-label">Estado auditoría:</span>
                {{ humanStatusPresentation(email.humanStatus).label }}</p>
              <p><span class="summary-label">Asignado a:</span>
                {{ valueOrDash(email.assignedTo?.username || email.assignedTo?.name) }}</p>
              <p><span class="summary-label">Auditado por:</span>
                {{ valueOrDash(email.auditedBy?.username || email.auditedBy?.name) }}</p>
              <p><span class="summary-label">Fecha auditoría:</span> {{ formatDate(email.auditedAt) }}</p>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel class="sketch-card detail-panel" rounded="lg">
          <v-expansion-panel-title class="detail-panel-title">
            Email
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="summary-block">

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
              <p><span class="summary-label">Monto Transferido:</span> {{
                  formatCurrency(email.amount, email.currency)
                }}</p>
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
            class="affiliate-strategy-chip"
          >
            Estrategia Afiliado:
            <strong class="affiliate-strategy-value">{{ valueOrDash(email.affiliateStrategy) }}</strong>
          </v-chip>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="partialForm.amount"
              label="Monto comprobante"
              type="number"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :readonly="readonly"
              class="sketch-input mt-3"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-date-input
              v-model="partialForm.transferDate"
              label="Fecha de transferencia"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :readonly="readonly"
              clearable
              class="sketch-input mt-3"
              prepend-icon=""
            />
          </v-col>
        </v-row>





        <v-expansion-panels
          v-model="affiliatesPanel"
          variant="accordion"
          class="additional-affiliates-panel"
        >
          <v-expansion-panel class="additional-affiliates-card" rounded="lg">
            <v-expansion-panel-title class="additional-affiliates-title">
              Afiliados
              <v-chip
                size="x-small"
                variant="tonal"
                color="teal"
                class="ml-2"
              >
                {{ partialForm.affiliates.length }}
              </v-chip>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div
                v-for="(affiliate, index) in partialForm.affiliates"
                :key="index"
                class="additional-affiliate-row"
              >
                <v-row class="align-start" dense>
                  <v-col cols="12" md="5">
                    <v-text-field
                      v-model="affiliate.name"
                      label="Nombre"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :readonly="readonly"
                      class="sketch-input"
                    />
                  </v-col>

                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model.number="affiliate.amount"
                      label="Monto afiliado"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :readonly="readonly || partialForm.affiliates.length === 1"
                      class="sketch-input"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="affiliate.documentNumber"
                      label="Documento"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :readonly="readonly"
                      class="sketch-input"
                    />
                  </v-col>

                  <v-col cols="12" md="3">
                    <v-select
                      v-model="affiliate.month"
                      :items="months"
                      label="Mes"
                      placeholder="Seleccionar mes"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :readonly="readonly"
                      clearable
                      class="sketch-input"
                    />
                  </v-col>

                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="affiliate.observations"
                      label="Observaciones"
                      placeholder="Ingresar observaciones"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :readonly="readonly"
                      class="sketch-input observations-input"
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    md="1"
                  >
                    <v-btn
                      icon="mdi-delete-outline"
                      variant="text"
                      color="error"
                      :disabled="readonly"
                      @click="removeAffiliate(index)"
                    />
                  </v-col>
                </v-row>

                <v-divider
                  v-if="index < partialForm.affiliates.length - 1"
                  class="my-3"
                />
              </div>

              <div
                v-if="!partialForm.affiliates.length"
                class="additional-affiliates-empty"
              >
                No hay afiliados cargados.
              </div>

              <v-btn
                color="teal"
                variant="tonal"
                size="small"
                prepend-icon="mdi-plus"
                :disabled="readonly"
                class="mt-2"
                @click="addAffiliate"
              >
                Agregar afiliado
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div class="human-status-group mt-3">
          <div class="human-status-group__label">Estado auditoría</div>
          <div class="human-status-group__actions">
            <v-btn
              v-for="option in humanStatusOptions"
              :key="option.value"
              :color="partialForm.humanStatus === option.value ? option.color : undefined"
              :variant="partialForm.humanStatus === option.value ? 'flat' : 'outlined'"
              :disabled="readonly"
              class="human-status-group__button"
              @click="setHumanStatus(option.value)"
            >
              {{ option.title }}
            </v-btn>
          </div>
        </div>

        <v-divider class="mt-2"></v-divider>

        <v-card-actions>
          <v-checkbox
            v-if="!readonly"
            v-model="closeInboundEmail"
            label="Cerrar correo"
            density="compact"
            hide-details
            class="close-inbound-email-checkbox"
          />
          <v-btn
            v-if="inboundEmailManagementUrl"
            :href="inboundEmailManagementUrl"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            color="primary"
            prepend-icon="mdi-email-arrow-right-outline"
          >
            Ir al correo
          </v-btn>

          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            :loading="savingMetadata"
            :disabled="readonly || !email._id"
            @click="saveMetadata"
          >
            Guardar
          </v-btn>

        </v-card-actions>

        <div
          v-if="!readonly && (savingMetadata || metadataSaveError || metadataSaveSuccess)"
          class="metadata-save-state"
          :class="{
            'metadata-save-state--error': metadataSaveError,
            'metadata-save-state--success': metadataSaveSuccess && !metadataSaveError && !savingMetadata
          }"
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
    </v-col>
  </v-row>

  </div>
</template>

<style scoped>
.status-overview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
</style>

<style scoped>
.transfer-email-layout {
  --transfer-border: rgba(var(--v-theme-on-surface), 0.42);
  --transfer-muted: rgba(var(--v-theme-on-surface), 0.68);
  --transfer-preview-surface: rgb(var(--v-theme-surface-variant));
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
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.affiliate-strategy-chip {
  flex: 0 0 auto;
  font-size: 0.88rem;
}

.affiliate-strategy-value {
  margin-left: 4px;
}

.human-status-group {
  display: grid;
  gap: 8px;
}

.human-status-group__label {
  font-size: 0.84rem;
  font-weight: 600;
}

.human-status-group__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.human-status-group__button {
  min-width: 118px;
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

.additional-affiliate-row__actions {
  min-height: 40px;
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
  justify-content: center;
  min-height: 20px;
  color: var(--transfer-muted);
  font-size: 0.86rem;
  font-weight: 600;
  margin-top: 4px;
  text-align: center;
}

.metadata-save-state--error {
  color: rgb(var(--v-theme-error));
}

.metadata-save-state--success {
  color: rgb(var(--v-theme-success));
}

.sketch-input :deep(.v-field__outline) {
  --v-field-border-width: 2px;
  --v-field-border-opacity: 0.42;
}

.observations-input :deep(textarea) {
  min-height: 88px;
}

.left-tabs-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.left-tabs {
  border-bottom: 2px solid var(--transfer-border);
}

.left-tab-window {
  height: min(720px, calc(100vh - 220px));
  min-height: 560px;
}

.left-tab-window :deep(.v-window__container),
.left-tab-window :deep(.v-window-item) {
  height: 100%;
}

.left-tab-content {
  height: 100%;
  padding: 12px;
  overflow: auto;
}

.proof-tab-content {
  display: flex;
  flex-direction: column;
}

.proof-preview {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.proof-image-link {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 0;
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
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
  background: var(--transfer-preview-surface);
}

.proof-pdf-frame {
  width: 100%;
  height: 100%;
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
  height: 100%;
  min-height: 0;
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

.ocr-text {
  white-space: pre-wrap;
  font-size: 0.95rem;
  line-height: 1.35;
}

.email-tab-content {
  padding: 8px;
}

@media (max-width: 900px) {
  .left-tab-window {
    height: 560px;
    min-height: 560px;
  }

  .additional-affiliate-row__actions {
    justify-content: flex-start;
    min-height: unset;
  }
}
</style>
