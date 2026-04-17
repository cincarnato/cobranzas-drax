<script setup lang="ts">
import {ref} from "vue";
import MailboxProvider from "../providers/MailboxProvider";
import type {InboundEmailSyncResult} from "../providers/MailboxProvider";

const loading = ref(false);
const result = ref<InboundEmailSyncResult | null>(null);
const errorMessage = ref("");

async function runSync() {
  loading.value = true;
  errorMessage.value = "";

  try {
    result.value = await MailboxProvider.instance.syncInboundEmails();
  } catch (error: any) {
    result.value = null;
    errorMessage.value = error?.message || "No se pudo ejecutar la sincronizacion.";
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
          <v-card-title class="text-h5">Sincronizacion de correos entrantes</v-card-title>
          <v-card-text class="d-flex flex-column ga-4">
            <div>
              Ejecuta manualmente la lectura de los mailboxes IMAP habilitados y espera el resultado del procesamiento.
            </div>

            <div class="d-flex ga-3 align-center">
              <v-btn
                color="primary"
                :loading="loading"
                :disabled="loading"
                @click="runSync"
              >
                Ejecutar sincronizacion
              </v-btn>
            </div>

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
                <div><strong>Mailboxes procesados:</strong> {{ result.processedMailboxes }}</div>
                <div><strong>Correos leidos:</strong> {{ result.fetchedEmails }}</div>
                <div><strong>Correos creados:</strong> {{ result.createdEmails }}</div>
                <div><strong>Correos omitidos:</strong> {{ result.skippedEmails }}</div>

                <div v-if="result.errors.length">
                  <strong>Errores:</strong>
                  <v-list density="compact">
                    <v-list-item
                      v-for="(item, index) in result.errors"
                      :key="`${item.mailboxId}-${index}`"
                    >
                      <v-list-item-title>{{ item.mailboxId }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.error }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>

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
