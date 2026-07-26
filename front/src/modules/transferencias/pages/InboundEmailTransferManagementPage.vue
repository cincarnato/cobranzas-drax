<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import EmailThreadItem from "@/modules/mail/components/mailbox/EmailThreadItem.vue";
import type {EmailThreadEntry} from "@/modules/mail/interfaces/IEmailManagement";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import InboundEmailProvider from "@/modules/mail/providers/InboundEmailProvider";
import TransferEmail from "@/modules/transferencias/components/TransferEmail.vue";
import type {ITransferEmail} from "@/modules/transferencias/interfaces/ITransferEmail";
import TransferEmailProvider from "@/modules/transferencias/providers/TransferEmailProvider";

const route = useRoute()
const {t} = useI18n()

const loading = ref(false)
const loadingInboundEmail = ref(false)
const processing = ref(false)
const transferEmails = ref<ITransferEmail[]>([])
const inboundEmail = ref<IInboundEmail | null>(null)
const selectedTransferEmailId = ref<string | null>(null)
const errorMessage = ref("")
const inboundEmailError = ref("")
const processMessage = ref("")
const processMessageType = ref<"info" | "warning" | "error">("info")

const inboundEmailId = computed(() => {
  const value = route.query.inboundEmail
  if (Array.isArray(value)) return value[0] ? String(value[0]) : ""
  return value ? String(value) : ""
})

const selectedTransferEmail = computed(() =>
  transferEmails.value.find((transferEmail) => transferEmail._id === selectedTransferEmailId.value)
  || transferEmails.value[0]
  || null
)

const transferEmailOptions = computed(() =>
  transferEmails.value.map((transferEmail) => ({
    title: [
      transferEmail._id,
      transferEmail.emailSubject,
      transferEmail.amount ? formatCurrency(transferEmail.amount, transferEmail.currency) : null,
    ].filter(Boolean).join(" - "),
    value: transferEmail._id,
  }))
)
const inboundEmailThreadEntry = computed<EmailThreadEntry | null>(() => inboundEmail.value
  ? {
      id: inboundEmail.value._id,
      type: "INBOUND",
      date: inboundEmail.value.receivedAt,
      inboundEmail: inboundEmail.value,
    }
  : null
)

watch(inboundEmailId, () => {
  void fetchTransferEmails()
  void fetchInboundEmail()
})

onMounted(() => {
  void fetchTransferEmails()
  void fetchInboundEmail()
})

async function fetchTransferEmails() {
  transferEmails.value = []
  selectedTransferEmailId.value = null
  processMessage.value = ""

  if (!inboundEmailId.value) {
    errorMessage.value = ""
    return
  }

  loading.value = true
  errorMessage.value = ""

  try {
    const result = await TransferEmailProvider.instance.findByInboundEmail(inboundEmailId.value)
    setTransferEmails(result || [])
  } catch (error) {
    console.error("Error fetching transfer email by inbound email:", error)
    errorMessage.value = t("transferemail.inboundManagement.errors.load")
  } finally {
    loading.value = false
  }
}

async function fetchInboundEmail() {
  inboundEmail.value = null
  inboundEmailError.value = ""

  if (!inboundEmailId.value) return

  loadingInboundEmail.value = true

  try {
    inboundEmail.value = await InboundEmailProvider.instance.findById(inboundEmailId.value)
  } catch (error) {
    console.error("Error fetching inbound email:", error)
    inboundEmailError.value = t("transferemail.inboundManagement.errors.loadInboundEmail")
  } finally {
    loadingInboundEmail.value = false
  }
}

async function processInboundEmail() {
  if (!inboundEmailId.value || processing.value) return

  processing.value = true
  errorMessage.value = ""
  processMessage.value = ""
  processMessageType.value = "info"

  try {
    const result = await TransferEmailProvider.instance.processInboundEmail(inboundEmailId.value)
    setTransferEmails(result.transferEmails || [])
    if (!result.transferEmails?.length) {
      processMessage.value = formatProcessMessage(result.message || t("transferemail.inboundManagement.noGenerated"), result.details)
      processMessageType.value = "warning"
    } else if (result.message) {
      processMessage.value = formatProcessMessage(result.message, result.details)
      processMessageType.value = result.reason === "manual-transfer-created-after-ai-error" ? "warning" : "info"
    }
  } catch (error: any) {
    console.error("Error processing inbound email as transfer:", error)
    errorMessage.value = error?.response?.data?.message || t("transferemail.inboundManagement.errors.process")
  } finally {
    processing.value = false
  }
}

function formatProcessMessage(message: string, details?: string) {
  return [message, details].filter(Boolean).join(" ")
}

function setTransferEmails(items: ITransferEmail[]) {
  transferEmails.value = items
  selectedTransferEmailId.value = items[0]?._id || null
}

function updateCurrentTransferEmail(updated: ITransferEmail) {
  transferEmails.value = transferEmails.value.map((transferEmail) =>
    transferEmail._id === updated._id ? updated : transferEmail
  )
}

function formatCurrency(amount?: number | null, currency?: string) {
  if (amount === null || amount === undefined) return ""
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "ARS",
  }).format(amount)
}
</script>

<template>
  <v-container fluid class="py-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
          <div>
            <div class="text-h5 font-weight-bold">{{ t("transferemail.inboundManagement.title") }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ t("transferemail.inboundManagement.inboundEmail", {id: inboundEmailId || "-"}) }}
            </div>
          </div>
          <v-btn
            variant="tonal"
            prepend-icon="mdi-refresh"
            :disabled="!inboundEmailId || loading || processing"
            @click="fetchTransferEmails"
          >
            {{ t("transferemail.inboundManagement.refresh") }}
          </v-btn>
        </div>

        <v-alert
          v-if="!inboundEmailId"
          type="warning"
          variant="tonal"
        >
          {{ t("transferemail.inboundManagement.missingInboundEmail") }}
        </v-alert>

        <v-alert
          v-else-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <v-alert
          v-if="processMessage"
          :type="processMessageType"
          variant="tonal"
          class="mb-4"
        >
          {{ processMessage }}
        </v-alert>

        <v-skeleton-loader
          v-if="loading"
          type="article"
        />

        <template v-else-if="inboundEmailId && selectedTransferEmail">
          <v-select
            v-if="transferEmails.length > 1"
            v-model="selectedTransferEmailId"
            :items="transferEmailOptions"
            :label="t('transferemail.inboundManagement.selectTransfer')"
            density="compact"
            variant="outlined"
            class="mb-4"
          />

          <TransferEmail
            :transfer-email="selectedTransferEmail"
            @saved="updateCurrentTransferEmail"
            @validated="updateCurrentTransferEmail"
            @corrected="updateCurrentTransferEmail"
            @discarded="updateCurrentTransferEmail"
          />
        </template>

        <div
          v-else-if="inboundEmailId"
          class="d-flex flex-column ga-4 py-6"
        >
          <div class="text-center">
            <v-icon icon="mdi-bank-transfer" size="56" color="primary" />
            <div class="mt-3">
              <div class="text-h6">{{ t("transferemail.inboundManagement.noTransferTitle") }}</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                {{ t("transferemail.inboundManagement.noTransferText") }}
              </div>
            </div>
          </div>

          <div>
            <div class="text-subtitle-2 mb-2">{{ t("transferemail.inboundManagement.emailPreview") }}</div>
            <v-skeleton-loader
              v-if="loadingInboundEmail"
              type="article"
            />
            <v-alert
              v-else-if="inboundEmailError"
              type="error"
              variant="tonal"
            >
              {{ inboundEmailError }}
            </v-alert>
            <EmailThreadItem
              v-else-if="inboundEmailThreadEntry"
              :entry="inboundEmailThreadEntry"
            />
            <v-alert
              v-else
              type="warning"
              variant="tonal"
            >
              {{ t("transferemail.inboundManagement.emailNotFound") }}
            </v-alert>
          </div>

          <div class="d-flex justify-center">
            <v-btn
              color="primary"
              prepend-icon="mdi-cog-play-outline"
              :loading="processing"
              @click="processInboundEmail"
            >
              {{ t("transferemail.inboundManagement.process") }}
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
