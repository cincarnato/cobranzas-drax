
<script setup lang="ts">
import BonusCrud from '../../cruds/BonusCrud'
import {Crud} from '@drax/crud-vue'
import {formatDate} from '@drax/common-front'

const statusColor = (status?: string) => {
  const colors: Record<string, string> = {
    Pendiente: 'warning',
    Aplicado: 'success',
    'No aplicado': 'error'
  }

  return colors[status ?? ''] ?? 'grey'
}

const statusIcon = (status?: string) => {
  const icons: Record<string, string> = {
    Pendiente: 'mdi-clock-outline',
    Aplicado: 'mdi-check-circle-outline',
    'No aplicado': 'mdi-close-circle-outline'
  }

  return icons[status ?? ''] ?? 'mdi-help-circle-outline'
}

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(value))
}

</script>

<template>
  <crud :entity="BonusCrud.instance">
    <template v-slot:item.createdAt="{value}">
      <div class="field-cell date-cell">
        <v-icon icon="mdi-calendar-clock" size="16" color="primary" />
        <span>{{ formatDate(value) }}</span>
      </div>
    </template>

    <template v-slot:item.createdBy="{value}">
      <v-chip color="indigo" variant="tonal" size="small" prepend-icon="mdi-account">
        {{ value?.name || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.status="{value}">
      <v-chip
        :color="statusColor(value)"
        :prepend-icon="statusIcon(value)"
        variant="flat"
        size="small"
        class="status-chip"
      >
        {{ value || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.dni="{value}">
      <v-chip color="blue-grey" variant="tonal" size="small" prepend-icon="mdi-card-account-details-outline">
        {{ value || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.fullname="{value}">
      <div class="field-cell strong-cell">
        <v-avatar color="teal-lighten-5" size="26">
          <v-icon icon="mdi-account-circle" size="18" color="teal-darken-2" />
        </v-avatar>
        <span>{{ value || '-' }}</span>
      </div>
    </template>

    <template v-slot:item.plan="{value}">
      <v-chip color="cyan" variant="tonal" size="small" prepend-icon="mdi-clipboard-list-outline">
        {{ value || '-' }}
      </v-chip>
    </template>

    <template v-slot:item.appliedMonth="{value}">
        {{ value || '-' }}
    </template>

    <template v-slot:item.paymentMethod="{value}">
        {{ value || '-' }}
    </template>

    <template v-slot:item.bonus="{value}">
        {{ value || '-' }}
    </template>

    <template v-slot:item.period="{value}">
        {{ value || '-' }}
    </template>

    <template v-slot:item.bonifiedNetValue="{value}">
        <span>{{ formatCurrency(value) }}</span>
    </template>

    <template v-slot:item.observation="{value}">

        {{ value || 'Sin observación' }}
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
  font-weight: 800;
  padding: 4px 10px;
}

.status-chip {
  font-weight: 800;
  letter-spacing: 0.01em;
}

.observation-chip {
  max-width: 260px;
}
</style>
