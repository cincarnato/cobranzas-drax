<script setup lang="ts">
import {ref} from "vue";
import {DashboardView} from "@drax/dashboard-vue";
import type {IDashboardBase} from "@drax/dashboard-share";
import createCovenantDashboard from "../dashboards/CovenantDashboard";

const dashboard = ref<IDashboardBase>(createCovenantDashboard());
</script>

<template>
  <v-container fluid>
    <dashboard-view :dashboard="dashboard" />
  </v-container>
</template>
