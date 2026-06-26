<script setup lang="ts">
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {MediaFullField} from "@drax/media-vue";
import PadronProvider, {type PadronImportFile, type PadronImportResult} from "../providers/PadronProvider";

const {t} = useI18n();
const fileInput = ref<PadronImportFile>({});
const loading = ref(false);
const confirmReplace = ref(false);
const errorMessage = ref("");
const lastResult = ref<PadronImportResult | null>(null);

const canImport = computed(() => Boolean(fileInput.value?.filepath) && confirmReplace.value && !loading.value);

async function importPadron() {
  if (!fileInput.value?.filepath) {
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  lastResult.value = null;

  try {
    lastResult.value = await PadronProvider.instance.importFile(fileInput.value);
    fileInput.value = {};
    confirmReplace.value = false;
  } catch (error: any) {
    errorMessage.value = error?.message || t("padron.import.error");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" lg="8" xl="6">
        <v-card variant="flat" border>
          <v-card-title class="d-flex align-center ga-2">
            <v-icon icon="mdi-database-import-outline" />
            <span>{{ t("padron.import.title") }}</span>
          </v-card-title>

          <v-card-text>
            <v-alert
              class="mb-4"
              type="warning"
              variant="tonal"
              density="comfortable"
              :text="t('padron.import.warning')"
            />

            <media-full-field
              v-model="fileInput"
              dir="padron-imports"
              accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              :label="t('padron.import.file')"
              :readonly="loading"
              prepend-icon=""
              prepend-inner-icon="mdi-file-excel-outline"
              variant="outlined"
              clearable
              :timeout="600000"
            />

            <v-checkbox
              v-model="confirmReplace"
              :label="t('padron.import.confirm')"
              :disabled="loading"
              density="comfortable"
              hide-details
            />

            <v-alert
              v-if="errorMessage"
              class="mt-4"
              type="error"
              variant="tonal"
              density="comfortable"
              :text="errorMessage"
            />

            <v-alert
              v-if="lastResult"
              class="mt-4"
              type="success"
              variant="tonal"
              density="comfortable"
            >
              {{ t("padron.import.success", {count: lastResult.rowCount}) }}
            </v-alert>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn
              color="primary"
              variant="flat"
              :loading="loading"
              :disabled="!canImport"
              prepend-icon="mdi-upload"
              @click="importPadron"
            >
              {{ t("padron.import.submit") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
