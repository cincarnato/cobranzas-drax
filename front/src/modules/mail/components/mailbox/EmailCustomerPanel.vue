<script setup lang="ts">
defineProps<{customer?: {name?: string, documentNumber?: string, cuil?: string, email?: string, phone?: string}}>()
</script>

<template>
  <div v-if="customer && Object.values(customer).some(Boolean)">
    <div class="text-subtitle-2 mb-2">Cliente</div>
    <v-list density="compact" class="pa-0">
      <v-list-item v-if="customer.name" title="Nombre" :subtitle="customer.name" />
      <v-list-item v-if="customer.documentNumber" title="Documento" :subtitle="customer.documentNumber" />
      <v-list-item v-if="customer.cuil" title="CUIL" :subtitle="customer.cuil" />
      <v-list-item v-if="customer.email" title="Email" :subtitle="customer.email" />
      <v-list-item v-if="customer.phone" title="Teléfono" :subtitle="customer.phone" />
    </v-list>
  </div>
</template>
