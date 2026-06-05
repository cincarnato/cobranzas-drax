<script setup lang="ts">
import {ref} from "vue";
import TransferEmailProvider from "../providers/TransferEmailProvider";
import type {TransferInboundEmailProcessResult} from "../providers/TransferEmailProvider";

const loading = ref(false);
const result = ref<TransferInboundEmailProcessResult | null>(null);
const errorMessage = ref("");
const since = ref("");
const limit = ref<number | null>(10);

function buildProcessingPayload() {
  const payload: { since?: string; limit?: number } = {};

  if (since.value) {
    const parsedSince = new Date(since.value);
    if (Number.isNaN(parsedSince.getTime())) {
      throw new Error("La fecha desde indicada no es válida.");
    }

    payload.since = parsedSince.toISOString();
  }

  if (limit.value !== null && limit.value !== undefined) {
    const parsedLimit = Number(limit.value);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      throw new Error("El límite debe ser un número entero mayor o igual a 1.");
    }

    payload.limit = parsedLimit;
  }

  return payload;
}

async function runProcessing() {
  loading.value = true;
  errorMessage.value = "";

  try {
    result.value = await TransferEmailProvider.instance.processInboundEmails(buildProcessingPayload());
  } catch (error: any) {
    result.value = null;
    errorMessage.value = error?.message || "No se pudo ejecutar el procesamiento de correos de transferencia.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3">
          <v-card-title class="text-h5">Procesar correos de transferencias</v-card-title>
          <v-card-text class="d-flex flex-column ga-4">
            <div>
              Ejecuta manualmente el procesamiento de correos entrantes para detectar comprobantes de transferencia y crear registros de `TransferEmail`.
            </div>

            <v-row dense>
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="since"
                  label="Procesar desde"
                  type="datetime-local"
                  variant="outlined"
                  density="comfortable"
                  hint="Opcional. Si se deja vacío, se usa la última transferencia procesada."
                  persistent-hint
                  :disabled="loading"
                />
              </v-col>

              <v-col cols="12" md="5">
                <v-text-field
                  v-model.number="limit"
                  label="Límite de correos"
                  type="number"
                  min="1"
                  step="1"
                  variant="outlined"
                  density="comfortable"
                  hint="Default: 10 por pasada."
                  persistent-hint
                  :disabled="loading"
                />
              </v-col>
            </v-row>

            <div class="d-flex ga-3 align-center">
              <v-btn
                color="primary"
                :loading="loading"
                :disabled="loading"
                @click="runProcessing"
              >
                Procesar correos
              </v-btn>
            </div>

            <v-alert
              v-if="loading"
              type="info"
              variant="tonal"
            >
              El procesamiento puede demorar porque analiza asunto, cuerpo y OCR de adjuntos con IA.
            </v-alert>

            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
            >
              {{ errorMessage }}
            </v-alert>

            <v-card
              v-if="result"
              variant="outlined"
            >
              <v-card-title class="text-subtitle-1">Resultado</v-card-title>
              <v-card-text class="d-flex flex-column ga-2">
                <div><strong>Desde:</strong> {{ result.since || "Inicio del historial" }}</div>
                <div><strong>Límite aplicado:</strong> {{ result.limit }}</div>
                <div><strong>Correos escaneados:</strong> {{ result.scanned }}</div>
                <div><strong>Transferencias creadas:</strong> {{ result.created }}</div>
                <div><strong>Correos omitidos:</strong> {{ result.skipped }}</div>

                <div>
                  <strong>JSON:</strong>
                  <pre class="result-box">{{ JSON.stringify(result, null, 2) }}</pre>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.result-box {
  white-space: pre-wrap;
  word-break: break-word;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  padding: 16px;
}
</style>
