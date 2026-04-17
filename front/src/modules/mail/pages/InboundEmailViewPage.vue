<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import InboundEmailView from "@/modules/mail/components/InboundEmailView.vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import InboundEmailProvider from "../providers/InboundEmailProvider";

const route = useRoute()

const loadingInboundEmail = ref(false)
const inboundEmail = ref<IInboundEmail | null>(null)
const errorMessage = ref('')

const inboundEmailId = computed(() => {
  const routeId = route.params.inboundEmailId
  return Array.isArray(routeId) ? routeId[0] : routeId
})

watch(inboundEmailId, () => {
  void fetchInboundEmail()
})

onMounted(() => {
  void fetchInboundEmail()
})

async function fetchInboundEmail() {
  if (!inboundEmailId.value) {
    inboundEmail.value = null
    errorMessage.value = ''
    return
  }

  loadingInboundEmail.value = true
  errorMessage.value = ''

  try {
    inboundEmail.value = await InboundEmailProvider.instance.findById(inboundEmailId.value)
  } catch (error) {
    console.error('Error fetching inbound email:', error)
    inboundEmail.value = null
    errorMessage.value = 'No se pudo cargar el correo entrante.'
  } finally {
    loadingInboundEmail.value = false
  }
}
</script>

<template>
  <v-container fluid class="py-6">
    <v-alert
      v-if="!inboundEmailId"
      type="warning"
      variant="tonal"
    >
      Falta el identificador del correo en la ruta.
    </v-alert>

    <template v-else-if="inboundEmail">
      <InboundEmailView :inbound-email="inboundEmail" />
    </template>

    <v-skeleton-loader
      v-else-if="loadingInboundEmail"
      type="article"
    />

    <v-alert
      v-else
      type="error"
      variant="tonal"
    >
      {{ errorMessage || 'No se encontró el correo entrante.' }}
    </v-alert>
  </v-container>
</template>
