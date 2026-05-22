<script setup lang="ts">
import {ref} from "vue";
import {VDateInput} from "vuetify/labs/VDateInput";
import CustomDashboard from "../components/dashboards/CustomDashboard.vue";

const today = new Date(new Date().setHours(0, 0, 0, 0));
const dashboardRef = ref<InstanceType<typeof CustomDashboard> | null>(null);
const dashboardLoading = ref(false);

const filters = ref([
  {field: "date", operator: "eq", value: today},
])

function refreshDashboard() {
  dashboardRef.value?.refresh();
}
</script>

<template>
  <v-container fluid>
    <v-row
      class="mb-4"
      align="center"
    >
      <v-col cols="12" md="4" lg="3">
        <v-date-input
          v-model="filters[0].value"
          label="Filtrar por fecha"
          variant="outlined"
          hide-details="auto"
          clearable
        />
      </v-col>
      <v-col cols="12" md="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          variant="tonal"
          :loading="dashboardLoading"
          :disabled="dashboardLoading"
          @click="refreshDashboard"
        >
          Actualizar
        </v-btn>
      </v-col>
    </v-row>
    <custom-dashboard
      ref="dashboardRef"
      :filters="filters"
      @loading-change="dashboardLoading = $event"
    />
  </v-container>
</template>
