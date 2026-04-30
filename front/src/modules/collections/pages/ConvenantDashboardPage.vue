<script setup lang="ts">
import {ref} from "vue";
import {VDateInput} from "vuetify/labs/VDateInput";
import CustomDashboard from "../components/dashboards/CustomDashboard.vue";

const today = new Date(new Date().setHours(0, 0, 0, 0));

const filters = ref([
  {field: "date", operator: "eq", value: today},
])
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12" md="4" lg="3">
        <v-date-input
          v-model="filters[0].value"
          label="Filtrar por fecha"
          variant="outlined"
          hide-details="auto"
          clearable
        />
      </v-col>
    </v-row>
    <custom-dashboard :filters="filters" />
  </v-container>
</template>
