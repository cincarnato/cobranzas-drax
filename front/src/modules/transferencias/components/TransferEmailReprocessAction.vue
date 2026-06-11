<script setup lang="ts">
import {computed, ref} from 'vue'
import TransferEmailProvider from "../providers/TransferEmailProvider";
import type {ITransferEmail} from "../interfaces/ITransferEmail";
import type {TransferEmailReprocessResult} from "../providers/TransferEmailProvider";

const props = defineProps<{
  item: unknown
}>()

const emit = defineEmits<{
  reprocessed: [result: TransferEmailReprocessResult]
}>()

const reprocessing = ref(false)
const reprocessDialog = ref(false)
const reprocessItem = ref<ITransferEmail | null>(null)
const reprocessPreviousItem = ref<ITransferEmail | null>(null)
const reprocessResult = ref<TransferEmailReprocessResult | null>(null)
const reprocessError = ref('')

function getTransferEmail() {
  return props.item as ITransferEmail
}

function closeReprocessDialog() {
  if (reprocessing.value) {
    return
  }

  reprocessDialog.value = false
}

function buildReprocessSuccessMessage(result: TransferEmailReprocessResult) {
  const payerMessage = result.payerFound
    ? `Se encontro un Pagador con estrategia ${result.payerStrategy || result.currentAffiliateStrategy || '-'}.`
    : 'No se encontro un Pagador aplicable con los mapeos actuales.'

  if (result.changed) {
    return `${payerMessage} Se actualizaron los datos del afiliado y la estrategia de identificacion.`
  }

  return `${payerMessage} No se encontraron cambios para aplicar sobre los datos del afiliado ni la estrategia.`
}

function cloneTransferEmail(item: ITransferEmail): ITransferEmail {
  return JSON.parse(JSON.stringify(item))
}

function formatValue(value?: string | null) {
  return value || '-'
}

function formatAdditionalAffiliates(affiliates?: ITransferEmail['additionalAffiliates']) {
  const formatted = (affiliates || [])
    .map((affiliate) => [
      affiliate.name,
      affiliate.email,
      affiliate.documentNumber
    ].filter(Boolean).join(' / '))
    .filter(Boolean)

  return formatted.length > 0 ? formatted.join('; ') : '-'
}

const reprocessChangedFields = computed(() => {
  if (!reprocessPreviousItem.value || !reprocessResult.value) {
    return []
  }

  if (reprocessResult.value.changes?.length) {
    return reprocessResult.value.changes
  }

  const previous = reprocessResult.value.previousTransferEmail || reprocessPreviousItem.value
  const current = {
    ...previous,
    ...reprocessResult.value.transferEmail,
    ...reprocessResult.value.updatedFields
  }
  const fields = [
    {
      label: 'Afiliado',
      before: formatValue(previous.affiliateName),
      after: formatValue(current.affiliateName)
    },
    {
      label: 'Email afiliado',
      before: formatValue(previous.affiliateEmail),
      after: formatValue(current.affiliateEmail)
    },
    {
      label: 'DNI afiliado',
      before: formatValue(previous.affiliateDocumentNumber),
      after: formatValue(current.affiliateDocumentNumber)
    },
    {
      label: 'Estrategia',
      before: formatValue(previous.affiliateStrategy),
      after: formatValue(current.affiliateStrategy)
    },
    {
      label: 'Afiliados adicionales',
      before: formatAdditionalAffiliates(previous.additionalAffiliates),
      after: formatAdditionalAffiliates(current.additionalAffiliates)
    }
  ]

  return fields.filter((field) => field.before !== field.after)
})

async function reprocessTransfer() {
  const transferEmail = getTransferEmail()
  if (!transferEmail?._id || reprocessing.value) {
    return
  }

  reprocessItem.value = cloneTransferEmail(transferEmail)
  reprocessPreviousItem.value = cloneTransferEmail(transferEmail)
  reprocessResult.value = null
  reprocessError.value = ''
  reprocessDialog.value = true
  reprocessing.value = true

  try {
    const result = await TransferEmailProvider.instance.reprocess(transferEmail._id)
    reprocessResult.value = result
    emit('reprocessed', result)
  } catch (e: any) {
    reprocessError.value = e?.message ?? 'Ocurrio un error al reprocesar la transferencia.'
  } finally {
    reprocessing.value = false
  }
}
</script>

<template>
  <v-tooltip text="Reprocesar transferencia con mapeos actuales de Pagador" location="top">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        size="small"
        variant="text"
        icon="mdi-sync"
        color="primary"
        :loading="reprocessing"
        :disabled="reprocessing"
        @click="reprocessTransfer"
      />
    </template>
  </v-tooltip>

  <v-dialog v-model="reprocessDialog" max-width="640" persistent>
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-sync" color="primary" />
        <span>Reprocesar transferencia</span>
      </v-card-title>

      <v-card-text>
        <div v-if="reprocessItem" class="reprocess-summary">
          <div><strong>ID:</strong> {{ reprocessItem._id }}</div>
          <div><strong>Afiliado anterior:</strong> {{ reprocessItem.affiliateName || '-' }}</div>
          <div><strong>DNI anterior:</strong> {{ reprocessItem.affiliateDocumentNumber || '-' }}</div>
          <div><strong>Estrategia anterior:</strong> {{ reprocessItem.affiliateStrategy || '-' }}</div>
        </div>

        <div v-if="reprocessing" class="reprocess-loading">
          <v-progress-circular indeterminate color="primary" size="42" />
          <span>Consultando mapeos actuales de Pagador...</span>
        </div>

        <v-alert
          v-else-if="reprocessResult"
          :type="reprocessResult.changed ? 'success' : 'info'"
          :color="reprocessResult.changed ? 'success' : 'info'"
          variant="tonal"
          class="mt-4"
        >
          {{ buildReprocessSuccessMessage(reprocessResult) }}
        </v-alert>

        <div
          v-if="reprocessResult?.changed && reprocessChangedFields.length"
          class="reprocess-changes mt-4"
        >
          <div class="reprocess-changes__title">Cambios aplicados</div>
          <div
            v-for="field in reprocessChangedFields"
            :key="field.label"
            class="reprocess-change-row"
          >
            <div class="reprocess-change-row__label">{{ field.label }}</div>
            <div class="reprocess-change-row__values">
              <span class="reprocess-change-row__before">{{ field.before }}</span>
              <v-icon icon="mdi-arrow-right" size="16" color="success" />
              <span class="reprocess-change-row__after">{{ field.after }}</span>
            </div>
          </div>
        </div>

        <v-alert
          v-else-if="reprocessResult?.changed"
          type="warning"
          color="warning"
          variant="tonal"
          class="mt-4"
        >
          El backend informo que hubo cambios, pero no envio el detalle de valores reemplazados.
        </v-alert>

        <v-alert
          v-if="!reprocessing && reprocessError"
          type="error"
          color="error"
          variant="tonal"
          class="mt-4"
        >
          {{ reprocessError }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          variant="flat"
          :disabled="reprocessing"
          @click="closeReprocessDialog"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.reprocess-summary {
  display: grid;
  gap: 6px;
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 0.92rem;
}

.reprocess-loading {
  align-items: center;
  color: rgb(var(--v-theme-primary));
  display: flex;
  gap: 14px;
  justify-content: center;
  min-height: 120px;
}

.reprocess-changes {
  border: 1px solid rgba(var(--v-theme-success), 0.24);
  border-radius: 8px;
  overflow: hidden;
}

.reprocess-changes__title {
  background: rgba(var(--v-theme-success), 0.10);
  color: rgb(var(--v-theme-success));
  font-weight: 800;
  padding: 8px 12px;
}

.reprocess-change-row {
  display: grid;
  gap: 8px;
  grid-template-columns: 150px minmax(0, 1fr);
  padding: 10px 12px;
}

.reprocess-change-row + .reprocess-change-row {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.reprocess-change-row__label {
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-weight: 700;
}

.reprocess-change-row__values {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}

.reprocess-change-row__before,
.reprocess-change-row__after {
  overflow-wrap: anywhere;
}

.reprocess-change-row__before {
  color: rgba(var(--v-theme-on-surface), 0.64);
  text-decoration: line-through;
}

.reprocess-change-row__after {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 800;
}

@media (max-width: 600px) {
  .reprocess-change-row {
    grid-template-columns: 1fr;
  }

  .reprocess-change-row__values {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
