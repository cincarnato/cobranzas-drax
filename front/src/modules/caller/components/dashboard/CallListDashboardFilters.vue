<script setup lang="ts">
import {computed} from "vue";
import {useAuth} from "@drax/identity-vue";
import { VDateInput } from 'vuetify/labs/VDateInput'
import GroupZoneCombobox from "../../../collections/comboboxes/GroupZoneCombobox.vue";
import CallListDashboardUserCombobox from "../../comboboxes/CallListDashboardUserCombobox.vue";

const {hasPermission} = useAuth()
const fromModel = defineModel<Date | null>('from', {default: null})
const toModel = defineModel<Date | null>('to', {default: null})
const groupsModel = defineModel<string[]>('groups', {default: []})
const usersModel = defineModel<string[]>('users', {default: []})

const emit = defineEmits<{
  apply: []
  reset: []
}>()

const hasActiveFilters = computed(() => {
  return !!fromModel.value || !!toModel.value || groupsModel.value.length > 0 || usersModel.value.length > 0
})
</script>

<template>
  <v-card class="dashboard-filters">
    <v-card-item>
      <v-card-title>Filtros</v-card-title>
      <v-card-subtitle>
        Acotá el tablero por vencimiento, grupo y usuario asignado.
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-date-input
            v-model="fromModel"
            label="Desde"
            variant="outlined"
            hide-details="auto"
            @update:model-value="emit('apply')"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-date-input
            v-model="toModel"
            label="Hasta"
            variant="outlined"
            hide-details="auto"
            @update:model-value="emit('apply')"
          />
        </v-col>

        <v-col cols="12" md="3" v-if="hasPermission('calllist:viewAll')">
          <GroupZoneCombobox
            v-model="groupsModel"
            label="Grupos"
            variant="outlined"
            hide-details
            multiple
            chips
            @update:model-value="emit('apply')"
          />
        </v-col>

        <v-col cols="12" md="3" v-if="hasPermission('calllist:viewAll')">
          <CallListDashboardUserCombobox
            v-model="usersModel"
            label="Usuarios"
            variant="outlined"
            hide-details
            multiple
            chips
            @update:model-value="emit('apply')"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="px-6 pb-6">
      <v-chip
        v-if="hasActiveFilters"
        color="primary"
        variant="tonal"
      >
        Filtros activos
      </v-chip>
      <v-spacer />
      <v-btn
        variant="text"
        :disabled="!hasActiveFilters"
        @click="emit('reset')"
      >
        Limpiar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.dashboard-filters {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
