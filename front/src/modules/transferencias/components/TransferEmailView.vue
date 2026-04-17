<script setup lang="ts">
import { computed, ref, watch } from "vue";
import InboundEmailView from "@/modules/mail/components/InboundEmailView.vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import { ITransferEmail } from "@/modules/transferencias/interfaces/ITransferEmail";
import InboundEmailProvider from "@/modules/mail/providers/InboundEmailProvider";

const props = defineProps<{
  transferEmail: ITransferEmail
}>()

const email = computed(() => props.transferEmail)
const inboundEmailPanel = ref<number | null>(null)
const loadingInboundEmail = ref(false)
const linkedInboundEmail = ref<IInboundEmail | null>(null)
const inboundEmailError = ref('')

const inboundEmailId = computed(() => {
  const linkedInboundEmail = email.value.inboundEmail
  if (!linkedInboundEmail) return null
  if (typeof linkedInboundEmail === 'string') return linkedInboundEmail
  if (typeof linkedInboundEmail === 'object' && '_id' in linkedInboundEmail) {
    return typeof linkedInboundEmail._id === 'string' ? linkedInboundEmail._id : null
  }
  return null
})
const hasLinkedInboundEmail = computed(() => Boolean(inboundEmailId.value))

watch(inboundEmailPanel, (value) => {
  if (value !== 0) return
  if (linkedInboundEmail.value || loadingInboundEmail.value || !inboundEmailId.value) return
  void fetchInboundEmail()
})

watch(inboundEmailId, () => {
  linkedInboundEmail.value = null
  inboundEmailError.value = ''
})

async function fetchInboundEmail() {
  if (!inboundEmailId.value) return

  loadingInboundEmail.value = true
  inboundEmailError.value = ''

  try {
    linkedInboundEmail.value = await InboundEmailProvider.instance.findById(inboundEmailId.value)
  } catch (error) {
    console.error('Error fetching inbound email:', error)
    linkedInboundEmail.value = null
    inboundEmailError.value = 'No se pudo cargar el email vinculado.'
  } finally {
    loadingInboundEmail.value = false
  }
}

// Formatting helpers
const formatCurrency = (amount?: number, currency?: string) => {
  if (!amount) return "-";
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS'
  }).format(amount);
};

const formatDate = (date?: Date | string) => {
  if (!date) return "-";
  return new Date(date).toLocaleString('es-AR');
};
</script>

<template>
  <v-container fluid class="pa-0">
    <v-row class="mb-4" v-if="email.needsHumanReview">
      <v-col cols="12">
        <v-alert
          type="warning"
          variant="tonal"
          icon="mdi-alert"
          title="Revisión Humana Requerida"
          text="Este comprobante requiere atención manual por posibles inconsistencias o validaciones pendientes."
          class="rounded-lg font-weight-medium"
        ></v-alert>
      </v-col>
    </v-row>

    <v-row>
      <!-- Datos de comprobante -->
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-lg elevation-2 border" variant="flat">
          <v-card-title class="d-flex align-center bg-primary-lighten-5 py-3">
            <v-icon color="primary" class="mr-2">mdi-receipt-text</v-icon>
            <span class="text-subtitle-1 font-weight-bold text-primary">Datos de Comprobante</span>
            <v-spacer></v-spacer>
            <v-chip
              v-if="email.isTransferProof"
              color="success"
              variant="flat"
              size="small"
              class="font-weight-bold"
            >
              Comprobante Válido
            </v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="py-4">
            <div class="text-center mb-6">
              <div class="text-overline text-medium-emphasis mb-1">Monto Transferido</div>
              <div class="text-h3 font-weight-bold text-primary">
                {{ formatCurrency(email.amount, email.currency) }}
              </div>
            </div>
            <v-list density="compact" class="bg-transparent">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey-darken-1" size="small">mdi-calendar-clock</v-icon>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">Fecha de Transferencia</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(email.transferDate) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey-darken-1" size="small">mdi-pound</v-icon>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">Número de Operación</v-list-item-title>
                <v-list-item-subtitle class="user-select-all">{{ email.operationNumber || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey-darken-1" size="small">mdi-text-box-outline</v-icon>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">Concepto</v-list-item-title>
                <v-list-item-subtitle>{{ email.concept || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Datos del afiliado -->
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-lg elevation-2 border" variant="flat">
          <v-card-title class="d-flex align-center bg-blue-grey-lighten-5 py-3">
            <v-icon color="blue-grey-darken-3" class="mr-2">mdi-account-details</v-icon>
            <span class="text-subtitle-1 font-weight-bold text-blue-grey-darken-3">Datos del Afiliado</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="py-4">
            <div class="d-flex align-center mb-6 px-4">
              <v-avatar color="blue-grey-lighten-4" size="64" class="mr-4 text-blue-grey-darken-4 font-weight-bold">
                {{ email.affiliateName ? email.affiliateName.charAt(0).toUpperCase() : '?' }}
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ email.affiliateName || 'Nombre no disponible' }}</div>
                <div class="text-subtitle-2 text-medium-emphasis">{{ email.affiliateEmail || 'Email no disponible' }}</div>
              </div>
            </div>
            <v-list density="compact" class="bg-transparent">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey-darken-1" size="small">mdi-card-account-details-outline</v-icon>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">Documento</v-list-item-title>
                <v-list-item-subtitle>{{ email.affiliateDocumentNumber || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cuenta Origen -->
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-lg elevation-1 border-s-xl bg-grey-lighten-5" style="border-left-color: #ECEFF1 !important;" variant="flat">
          <v-card-title class="d-flex align-center py-3">
            <v-icon color="grey-darken-2" class="mr-2">mdi-bank-transfer-out</v-icon>
            <span class="text-subtitle-1 font-weight-bold text-grey-darken-3">Cuenta Origen</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-list density="compact" class="bg-transparent">
              <v-list-item>
                <v-list-item-title class="text-caption text-medium-emphasis">Banco</v-list-item-title>
                <v-list-item-subtitle class="text-body-1 font-weight-medium">{{ email.originBank || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-medium-emphasis">Cuenta</v-list-item-title>
                <v-list-item-subtitle class="text-body-2 user-select-all">{{ email.originAccount || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-medium-emphasis">CBU/CVU</v-list-item-title>
                <v-list-item-subtitle class="text-body-2 user-select-all">{{ email.originCbu || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-medium-emphasis">Alias</v-list-item-title>
                <v-list-item-subtitle class="text-body-2 bg-grey-lighten-3 pa-1 rounded d-inline-block mt-1 user-select-all">
                  {{ email.originAlias || '-' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cuenta Destino -->
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-lg elevation-1 border-s-xl bg-teal-lighten-5" style="border-left-color: #E0F2F1 !important;" variant="flat">
          <v-card-title class="d-flex align-center py-3">
            <v-icon color="teal-darken-2" class="mr-2">mdi-bank-transfer-in</v-icon>
            <span class="text-subtitle-1 font-weight-bold text-teal-darken-3">Cuenta Destino</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-list density="compact" class="bg-transparent">
              <v-list-item>
                <v-list-item-title class="text-caption text-teal-darken-1">Banco</v-list-item-title>
                <v-list-item-subtitle class="text-body-1 font-weight-medium text-teal-darken-4">{{ email.destinationBank || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-teal-darken-1">Cuenta</v-list-item-title>
                <v-list-item-subtitle class="text-body-2 user-select-all text-teal-darken-4">{{ email.destinationAccount || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-teal-darken-1">CBU/CVU</v-list-item-title>
                <v-list-item-subtitle class="text-body-2 user-select-all text-teal-darken-4">{{ email.destinationCbu || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-teal-darken-1">Alias</v-list-item-title>
                <v-list-item-subtitle class="text-body-2 bg-teal-lighten-4 text-teal-darken-4 pa-1 rounded d-inline-block mt-1 user-select-all">
                  {{ email.destinationAlias || '-' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Footer Meta -->
    <v-row class="mt-2">
      <v-col cols="12">
        <div class="d-flex justify-end text-caption text-medium-emphasis px-2">
          <span class="mr-4"><v-icon size="x-small" class="mr-1">mdi-clock-outline</v-icon> Creado: {{ formatDate(email.createdAt) }}</span>
          <span><v-icon size="x-small" class="mr-1">mdi-update</v-icon> Actualizado: {{ formatDate(email.updatedAt) }}</span>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="hasLinkedInboundEmail" class="mt-4">
      <v-col cols="12">
        <v-expansion-panels
          v-model="inboundEmailPanel"
          variant="accordion"
        >
          <v-expansion-panel rounded="lg">
            <v-expansion-panel-title class="text-body-1 font-weight-medium">
              <v-icon icon="mdi-email-outline" class="mr-2" />
              Email vinculado
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-skeleton-loader
                v-if="loadingInboundEmail"
                type="article"
              />

              <v-alert
                v-else-if="inboundEmailError"
                type="error"
                variant="tonal"
                class="mb-2"
              >
                {{ inboundEmailError }}
              </v-alert>

              <InboundEmailView
                v-else-if="linkedInboundEmail"
                :inbound-email="linkedInboundEmail"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.user-select-all {
  user-select: all;
}
.border-s-xl {
  border-left-width: 6px !important;
  border-left-style: solid !important;
}
</style>
