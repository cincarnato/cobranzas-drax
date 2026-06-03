
<script setup lang="ts">
import TransferEmailCrud from '../../cruds/TransferEmailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import TransferEmail from "@/modules/transferencias/components/TransferEmail.vue";

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

</script>

<template>
  <crud :entity="TransferEmailCrud.instance">
    <template v-slot:item.inboundEmail="{value}">
      <span class="muted-cell">{{ value?.messageId || '-' }}</span>
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
        <span>{{ formatDate(value) }}</span>
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
      <v-chip color="cyan" variant="tonal" size="small" prepend-icon="mdi-card-account-details-outline">
        {{ value || '-' }}
      </v-chip>
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
      {{ formatDate(value) }}
    </template>

    <template v-slot:item.updatedAt="{value}">
      {{ formatDate(value) }}
    </template>

    <template v-slot:form="{form, operation}">
      <transfer-email
        v-if="operation === 'view' || operation === 'edit'"
        :transfer-email="form"
        :readonly="operation === 'view'"
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

.status-chip {
  font-weight: 800;
  letter-spacing: 0.01em;
}
</style>
