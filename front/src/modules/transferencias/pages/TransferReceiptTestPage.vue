<script setup lang="ts">
import {computed, ref} from "vue"
import {useI18n} from "vue-i18n"
import TransferReceiptTestProvider from "../providers/TransferReceiptTestProvider"
import type {TransferReceiptExtractionResult} from "../providers/TransferReceiptTestProvider"

type Concept = "CUOTA" | "COPAGO" | "FINANCIACION"

const {t} = useI18n()

const formRef = ref()
const selectedFile = ref<File | File[] | null>(null)
const extracting = ref(false)
const editableExtractedFields = ref(false)
const errorMessage = ref("")
const successMessage = ref("")
const extractionResult = ref<TransferReceiptExtractionResult | null>(null)

const form = ref({
  dni: "",
  concept: "CUOTA" as Concept,
  month: "",
  receiptDate: "",
  amount: null as number | null,
  operationNumber: "",
})

const conceptItems = computed(() => [
  {title: t("transferemail.receiptTest.concepts.cuota"), value: "CUOTA"},
  {title: t("transferemail.receiptTest.concepts.copago"), value: "COPAGO"},
  {title: t("transferemail.receiptTest.concepts.financiacion"), value: "FINANCIACION"},
])

const receiptFile = computed(() => {
  if (Array.isArray(selectedFile.value)) {
    return selectedFile.value[0] || null
  }

  return selectedFile.value || null
})

const extractionNotice = computed(() => {
  if (!extractionResult.value) {
    return t("transferemail.receiptTest.pending")
  }

  return extractionResult.value.extractionSource === "FALLBACK"
    ? t("transferemail.receiptTest.extractionFallbackText")
    : t("transferemail.receiptTest.extractedText")
})

const requiredRule = (value: unknown) => Boolean(value) || t("validation.required")
const dniRule = (value: string) => /^\d{7,8}$/.test(value || "") || t("transferemail.receiptTest.dniHint")
const amountRule = (value: number | null) => value !== null && Number(value) > 0 || t("validation.required")
const monthRule = (value: string) => form.value.concept !== "CUOTA" || Boolean(value) || t("validation.required")

function toDateInputValue(value: string | null): string {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString().slice(0, 10)
}

function fillExtractedFields(result: TransferReceiptExtractionResult) {
  form.value.receiptDate = toDateInputValue(result.receipt.transferDate)
  form.value.amount = result.receipt.amount
  form.value.operationNumber = result.receipt.operationNumber || ""
  editableExtractedFields.value = false
}

async function extractReceipt(value: File | File[] | null) {
  selectedFile.value = value
  extractionResult.value = null
  errorMessage.value = ""
  successMessage.value = ""
  editableExtractedFields.value = false
  form.value.receiptDate = ""
  form.value.amount = null
  form.value.operationNumber = ""

  if (!receiptFile.value) {
    return
  }

  extracting.value = true
  try {
    const result = await TransferReceiptTestProvider.instance.extract(receiptFile.value)
    extractionResult.value = result
    fillExtractedFields(result)
  } catch (error: any) {
    errorMessage.value = error?.message || t("transferemail.receiptTest.errors.file")
  } finally {
    extracting.value = false
  }
}

function toggleExtractedFieldsEdition() {
  editableExtractedFields.value = !editableExtractedFields.value
}

function clearForm() {
  selectedFile.value = null
  extractionResult.value = null
  errorMessage.value = ""
  successMessage.value = ""
  editableExtractedFields.value = false
  form.value = {
    dni: "",
    concept: "CUOTA",
    month: "",
    receiptDate: "",
    amount: null,
    operationNumber: "",
  }
}

async function submit() {
  successMessage.value = ""
  errorMessage.value = ""

  const {valid} = await formRef.value.validate()
  if (!valid || !receiptFile.value || !extractionResult.value) {
    errorMessage.value = t("transferemail.receiptTest.errors.required")
    return
  }

  successMessage.value = t("transferemail.receiptTest.submitOk")
}
</script>

<template>
  <v-container class="receipt-page py-4 py-sm-6">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="7" lg="5">
        <h1 class="text-h5 font-weight-bold mb-1">
          {{ t("transferemail.receiptTest.title") }}
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ t("transferemail.receiptTest.subtitle") }}
        </p>

        <v-form ref="formRef" @submit.prevent="submit">
          <v-sheet class="pa-4 pa-sm-5" rounded="lg" border>
            <v-file-input
              v-model="selectedFile"
              class="mb-2"
              variant="outlined"
              density="compact"
              accept="image/*,application/pdf"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              :label="t('transferemail.receiptTest.receipt')"
              :loading="extracting"
              :disabled="extracting"
              :rules="[requiredRule]"
              @update:model-value="extractReceipt"
            />

            <v-progress-linear
              v-if="extracting"
              class="mb-4"
              color="primary"
              indeterminate
              rounded
            />

            <v-row class="receipt-grid">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.dni"
                  variant="outlined"
                  density="compact"
                  inputmode="numeric"
                  prepend-inner-icon="mdi-card-account-details-outline"
                  :label="t('transferemail.receiptTest.dni')"
                  :rules="[requiredRule, dniRule]"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.concept"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-format-list-bulleted"
                  :items="conceptItems"
                  :label="t('transferemail.receiptTest.concept')"
                  :rules="[requiredRule]"
                />
              </v-col>

              <v-col v-if="form.concept === 'CUOTA'" cols="12">
                <v-text-field
                  v-model="form.month"
                  variant="outlined"
                  density="compact"
                  type="month"
                  prepend-inner-icon="mdi-calendar-month-outline"
                  :label="t('transferemail.receiptTest.month')"
                  :rules="[monthRule]"
                />
              </v-col>
            </v-row>

            <div v-if="extractionResult" class="mt-1">
              <div class="d-flex align-center justify-space-between ga-3 mb-3">
                <div class="text-subtitle-2 font-weight-medium">
                  {{ t("transferemail.receiptTest.extractedTitle") }}
                </div>

                <v-btn
                  size="small"
                  color="primary"
                  variant="tonal"
                  :prepend-icon="editableExtractedFields ? 'mdi-lock-outline' : 'mdi-pencil-outline'"
                  @click="toggleExtractedFieldsEdition"
                >
                  {{ editableExtractedFields ? t("transferemail.receiptTest.lock") : t("transferemail.receiptTest.correct") }}
                </v-btn>
              </div>

              <v-alert
                class="mb-3"
                type="warning"
                variant="tonal"
                density="compact"
                icon="mdi-alert-circle-outline"
              >
                {{ extractionNotice }}
              </v-alert>

              <v-row class="receipt-grid">
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.receiptDate"
                    variant="outlined"
                    density="compact"
                    type="date"
                    prepend-inner-icon="mdi-calendar-outline"
                    :readonly="!editableExtractedFields"
                    :label="t('transferemail.receiptTest.transferDate')"
                    :rules="[requiredRule]"
                  />
                </v-col>

                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model.number="form.amount"
                    variant="outlined"
                    density="compact"
                    type="number"
                    min="0"
                    step="0.01"
                    prepend-inner-icon="mdi-currency-usd"
                    :readonly="!editableExtractedFields"
                    :label="t('transferemail.receiptTest.amount')"
                    :rules="[amountRule]"
                  />
                </v-col>

                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.operationNumber"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-identifier"
                    :readonly="!editableExtractedFields"
                    :label="t('transferemail.receiptTest.operationNumber')"
                    :rules="[requiredRule]"
                  />
                </v-col>
              </v-row>
            </div>

            <v-alert v-if="errorMessage" class="mb-3" type="error" variant="tonal" density="compact">
              {{ errorMessage }}
            </v-alert>

            <v-alert v-if="successMessage" class="mb-3" type="success" variant="tonal" density="compact">
              {{ successMessage }}
            </v-alert>

            <div class="d-flex ga-2 mt-2">
              <v-btn
                class="flex-grow-1"
                variant="text"
                :disabled="extracting"
                @click="clearForm"
              >
                {{ t("transferemail.receiptTest.clear") }}
              </v-btn>
              <v-btn
                class="flex-grow-1"
                color="primary"
                type="submit"
                prepend-icon="mdi-send-outline"
                :loading="extracting"
                :disabled="!extractionResult"
              >
                {{ t("transferemail.receiptTest.send") }}
              </v-btn>
            </div>
          </v-sheet>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.receipt-page {
  max-width: 960px;
}

.receipt-grid {
  margin-top: 0;
  row-gap: 4px;
}
</style>
