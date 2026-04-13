<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import TransferEmailView from "@/modules/transferencias/components/TransferEmailView.vue";
import type {ITransferEmail} from "@/modules/transferencias/interfaces/ITransferEmail";
import TransferEmailProvider from "../providers/TransferEmailProvider";

const route = useRoute()

const loadingTransferEmail = ref(false)
const transferEmail = ref<ITransferEmail | null>(null)
const errorMessage = ref('')

const transferEmailId = computed(() => {
  const routeId = route.params.transferEmailId
  return Array.isArray(routeId) ? routeId[0] : routeId
})

watch(transferEmailId, () => {
  void fetchTransferEmail()
})

onMounted(() => {
  void fetchTransferEmail()
})

async function fetchTransferEmail() {
  if (!transferEmailId.value) {
    transferEmail.value = null
    errorMessage.value = ''
    return
  }

  loadingTransferEmail.value = true
  errorMessage.value = ''

  try {
    transferEmail.value = await TransferEmailProvider.instance.findById(transferEmailId.value)
  } catch (error) {
    console.error('Error fetching transfer email:', error)
    transferEmail.value = null
    errorMessage.value = 'No se pudo cargar el comprobante de transferencia.'
  } finally {
    loadingTransferEmail.value = false
  }
}
</script>

<template>
  <v-container fluid class="py-6">
    <v-alert
      v-if="!transferEmailId"
      type="warning"
      variant="tonal"
    >
      Falta el identificador del comprobante en la ruta.
    </v-alert>

    <template v-else-if="transferEmail">
      <TransferEmailView :transfer-email="transferEmail" />
    </template>

    <v-skeleton-loader
      v-else-if="loadingTransferEmail"
      type="article"
    />

    <v-alert
      v-else
      type="error"
      variant="tonal"
    >
      {{ errorMessage || 'No se encontró el comprobante de transferencia.' }}
    </v-alert>
  </v-container>
</template>
