<script setup lang="ts">
import {computed, ref} from "vue";
import {CrudFormField} from "@drax/crud-vue";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import MailToolsProvider, {
  type MailToolFile,
  type MailToolsExtractTextResult
} from "../providers/MailToolsProvider";

const formRef = ref();
const loading = ref(false);
const errorMessage = ref("");
const result = ref<MailToolsExtractTextResult | null>(null);
const form = ref<{file: MailToolFile}>({
  file: {},
});

const entity = {
  name: "MailTools",
  refs: {},
  rules: {},
} as unknown as IEntityCrud;

const fileField: IEntityCrudField = {
  name: "file",
  type: "fullFile",
  label: "Archivo",
  default: {},
  cols: 12,
  hint: "Subi una imagen o un PDF para probar OCR o extraccion de texto.",
  persistentHint: true,
};

const hasFile = computed(() => Boolean(form.value.file?.filepath));

async function submit() {
  const {valid} = await formRef.value.validate();
  if (!valid || !form.value.file?.filepath) {
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    result.value = await MailToolsProvider.instance.extractText(form.value.file);
  } catch (error: any) {
    result.value = null;
    errorMessage.value = error?.message || "No se pudo procesar el archivo.";
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.value = {file: {}};
  result.value = null;
  errorMessage.value = "";
}
</script>

<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3">
          <v-card-title class="text-h5">Prueba de OCR y PDF Text Extractor</v-card-title>
          <v-card-text class="d-flex flex-column ga-4">
            <div>
              Esta pantalla permite subir un archivo con `fullFile`, enviar su metadata al backend y devolver el texto
              extraido usando `TesseractOCR` o `PdfTextExtractor`.
            </div>

            <v-form ref="formRef" @submit.prevent="submit">
              <v-row>
                <v-col cols="12">
                  <crud-form-field
                    v-model="form.file"
                    :field="fileField"
                    :entity="entity"
                    :readonly="loading"
                    :variant="'outlined'"
                  />
                </v-col>
              </v-row>

              <div class="d-flex flex-wrap ga-3 mt-2">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  :disabled="loading || !hasFile"
                >
                  Extraer texto
                </v-btn>

                <v-btn
                  variant="text"
                  :disabled="loading"
                  @click="resetForm"
                >
                  Limpiar
                </v-btn>
              </div>
            </v-form>

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
              <v-card-text class="d-flex flex-column ga-3">
                <div><strong>Tool usada:</strong> {{ result.tool }}</div>
                <div><strong>Archivo:</strong> {{ result.filename || "Sin nombre" }}</div>
                <div><strong>Mimetype:</strong> {{ result.mimetype || "No informado" }}</div>
                <div><strong>Filepath:</strong> {{ result.filepath }}</div>

                <div>
                  <strong>Texto extraido:</strong>
                  <pre class="result-box">{{ result.text || "La herramienta no devolvio texto." }}</pre>
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
