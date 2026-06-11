
<script setup lang="ts">
import {computed, ref} from 'vue'
import TransferEmailCrud from '../../cruds/TransferEmailCrud'
import {Crud, useCrud, useCrudStore} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"
import TransferEmail from "@/modules/transferencias/components/TransferEmail.vue";
import TransferEmailHelpDialog from "@/modules/transferencias/components/TransferEmailHelpDialog.vue";
import TransferEmailReprocessAction from "@/modules/transferencias/components/TransferEmailReprocessAction.vue";
import TransferEmailProvider from "../../providers/TransferEmailProvider";
import type {IDraxFieldFilter} from "@drax/crud-share";

const transferEmailEntity = TransferEmailCrud.instance
const crudStore = useCrudStore(transferEmailEntity.name)
const {doPaginate} = useCrud(transferEmailEntity)
const helpDialog = ref(false)
const exportExcelLoading = computed({
  get() {
    return crudStore.exportLoading
  },
  set(value: boolean) {
    crudStore.setExportLoading(value)
  }
})

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2
  }).format(Number(value))
}

function expandRangeFilters(filters: Array<any>): IDraxFieldFilter[] {
  return filters.flatMap((filter) => {
    if (filter.operator !== 'range') {
      return [{
        field: 'field' in filter ? filter.field : filter.name,
        operator: filter.operator || 'eq',
        value: filter.value
      }]
    }

    const value = filter.value && typeof filter.value === 'object' && !Array.isArray(filter.value)
      ? filter.value
      : {from: null, to: null}
    const field = 'field' in filter ? filter.field : filter.name
    const expandedFilters: IDraxFieldFilter[] = []

    if (value.from !== null && value.from !== undefined && value.from !== '') {
      expandedFilters.push({field, operator: 'gte', value: value.from})
    }

    if (value.to !== null && value.to !== undefined && value.to !== '') {
      expandedFilters.push({field, operator: 'lte', value: value.to})
    }

    return expandedFilters
  })
}

function resolveFileName(response: Response) {
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const match = contentDisposition.match(/filename=\"?([^"]+)\"?/)
  return match?.[1] ?? `transferencias_${new Date().toISOString().slice(0, 10)}.xlsx`
}

async function refreshAfterReprocess() {
  await doPaginate()
}

async function refreshAfterMetadataSave() {
  await doPaginate()
}

async function exportExcel() {
  exportExcelLoading.value = true
  crudStore.setExportError(false)

  try {
    const filters = [
      ...expandRangeFilters(crudStore.filters),
      ...expandRangeFilters(crudStore.dynamicFilters)
    ]

    const response = await TransferEmailProvider.instance.exportExcel({
      orderBy: crudStore.sortBy[0]?.key,
      order: crudStore.sortBy[0]?.order,
      search: crudStore.search,
      filters,
      limit: 100000
    })

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

    crudStore.showMessage('El archivo Excel se genero correctamente.')
  } catch (e: any) {
    crudStore.setExportError(true)
    crudStore.setError(e?.message ?? 'Ocurrio un error al exportar.')
  } finally {
    exportExcelLoading.value = false
  }
}

</script>

<template>
  <crud :entity="transferEmailEntity">
    <template v-slot:toolbar-left>
      <v-tooltip text="Ayuda sobre el modulo de transferencias" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-help-circle-outline"
            color="primary"
            @click="helpDialog = true"
          />
        </template>
      </v-tooltip>

      <v-tooltip text="Exportar Excel segun filtros actuales" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-file-excel-outline"
            :loading="exportExcelLoading"
            :disabled="exportExcelLoading"
            @click="exportExcel"
          />
        </template>
      </v-tooltip>

      <transfer-email-help-dialog v-model="helpDialog" />
    </template>

    <template v-slot:item.actions="{item}">
      <transfer-email-reprocess-action
        :item="item"
        @reprocessed="refreshAfterReprocess"
      />
    </template>

    <template v-slot:item.inboundEmail="{value}">
      <span class="muted-cell">{{ value?.messageId || '-' }}</span>
    </template>

    <template v-slot:item.emailMessageId="{value}">
      <span class="muted-cell">{{ value || '-' }}</span>
    </template>

    <template v-slot:item.emailSubject="{value}">
      <span class="subject-cell">{{ value || '-' }}</span>
    </template>

    <template v-slot:item.emailFromName="{value}">
      <span>{{ value || '-' }}</span>
    </template>

    <template v-slot:item.emailFromEmail="{value}">
      <v-chip color="blue-grey" variant="tonal" size="small" prepend-icon="mdi-email-outline">
        {{ value || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.emailDocumentNumber="{value}">
      <v-chip color="cyan" variant="tonal">
        {{ value || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.isTransferProof="{value}">
      <v-chip
        :color="value ? 'success' : 'grey'"
        :prepend-icon="value ? 'mdi-check-circle-outline' : 'mdi-file-question-outline'"
        variant="tonal"
        size="small"
        class="status-chip"
      >
        {{ value ? 'Comprobante' : 'No detectado' }}
      </v-chip>
    </template>

    <template v-slot:item.amount="{value}">
      <span class="money-cell">{{ formatCurrency(value) }}</span>
    </template>

    <template v-slot:item.currency="{value}">
      <v-chip color="blue-grey" variant="tonal" size="small">
        {{ value || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.transferDate="{value}">
      <div class="field-cell date-cell">
        <v-icon icon="mdi-calendar" size="16" color="primary" />
        <span>{{ formatDateTime(value) }}</span>
      </div>
    </template>

    <template v-slot:item.emailDate="{value}">
      <div class="field-cell date-cell">
        <v-icon icon="mdi-email-clock-outline" size="16" color="primary" />
        <span>{{ formatDateTime(value) }}</span>
      </div>
    </template>

    <template v-slot:item.processDate="{value}">
      <div class="field-cell date-cell">
        <v-icon icon="mdi-cog-clockwise" size="16" color="primary" />
        <span>{{ formatDateTime(value) }}</span>
      </div>
    </template>

    <template v-slot:item.operationNumber="{value}">
      <v-chip color="indigo" variant="tonal" size="small" prepend-icon="mdi-pound">
        {{ value || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.affiliateName="{value}">
      <div class="field-cell strong-cell">
        <v-icon icon="mdi-account-circle" size="18" color="teal-darken-2" />
        <span>{{ value || '-' }}</span>
      </div>
    </template>

    <template v-slot:item.affiliateDocumentNumber="{value}">
      <v-chip color="cyan" variant="tonal"  >
        {{ value || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.additionalAffiliates="{value}">
      <div class="additional-affiliates-cell">
        <v-chip
          v-for="(affiliate, index) in value || []"
          :key="`${affiliate.documentNumber || affiliate.email || affiliate.name || 'affiliate'}-${index}`"
          color="teal"
          variant="tonal"
          size="small"
        >
          {{ [affiliate.name, affiliate.email, affiliate.documentNumber].filter(Boolean).join(' / ') || '-' }}
        </v-chip>
        <span v-if="!value?.length">-</span>
      </div>
    </template>

    <template v-slot:item.needsHumanReview="{value}">
      <v-chip
        :color="value ? 'warning' : 'success'"
        :prepend-icon="value ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline'"
        variant="flat"
        size="small"
        class="status-chip"
      >
        {{ value ? 'Revisar' : 'OK' }}
      </v-chip>
    </template>

    <template v-slot:item.createdAt="{value}">
      {{ formatDateTime(value) }}
    </template>

    <template v-slot:item.updatedAt="{value}">
      {{ formatDateTime(value) }}
    </template>

    <template v-slot:form="{form, operation}">
      <transfer-email
        v-if="operation === 'view' || operation === 'edit'"
        :transfer-email="form"
        :readonly="operation === 'view'"
        @saved="refreshAfterMetadataSave"
      />
    </template>

  </crud>
</template>

<style scoped>
.field-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  white-space: nowrap;
}

.strong-cell {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 700;
}

.date-cell {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.money-cell {
  border-radius: 999px;
  background: rgba(var(--v-theme-success), 0.10);
  color: rgb(var(--v-theme-success));
  display: inline-flex;
  font-weight: 800;
  padding: 4px 10px;
  white-space: nowrap;
}

.muted-cell {
  color: rgba(var(--v-theme-on-surface), 0.64);
}

.subject-cell {
  display: inline-block;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  font-weight: 800;
  letter-spacing: 0.01em;
}

.additional-affiliates-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 160px;
}
</style>
