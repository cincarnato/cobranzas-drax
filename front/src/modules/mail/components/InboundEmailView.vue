<script setup lang="ts">
import {computed} from "vue";
import {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import {DraxImagePreview} from "@drax/common-vue";

interface InboundAttachment {
  filename: string
  filepath: string
  size: number
  mimetype?: string
  url: string
}

const {inboundEmail} = defineProps<{
  inboundEmail: IInboundEmail
}>()

const emptyValue = "—";

const processingColor = computed(() => {
  const s = inboundEmail.processingStatus?.toLowerCase();
  if (s === 'processed' || s === 'completed') return 'success';
  if (s === 'error' || s === 'failed') return 'error';
  if (s === 'processing') return 'info';
  return 'default';
});

const sentimentColor = computed(() => {
  const val = inboundEmail.sentiment?.toLowerCase();
  if (val === 'positive' || val === 'positivo') return 'success';
  if (val === 'negative' || val === 'negativo') return 'error';
  return 'default';
});

const priorityColor = computed(() => {
  const val = inboundEmail.priority?.toLowerCase();
  if (val === 'high' || val === 'alta') return 'error';
  if (val === 'medium' || val === 'media') return 'warning';
  if (val === 'low' || val === 'baja') return 'success';
  return 'default';
});

const formatDateTime = (value?: Date | string | null) => {
  if (!value) return emptyValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyValue;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const formatBoolean = (value?: boolean | null, pos = "Sí", neg = "No") => {
  if (value === null || value === undefined) return emptyValue;
  return value ? pos : neg;
};

const dv = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return emptyValue;
  return String(value);
};

const formatFileSize = (size?: number) => {
  if (!size) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const confidencePct = (c?: number) => c != null ? Math.round(c * 100) : 0;

const hasBodyContent = computed(() =>
  inboundEmail.bodyText || inboundEmail.bodyHtml
);

const hasExtractedEntities = computed(() =>
  inboundEmail.extractedEntities?.length
);

const hasCustomerData = computed(() =>
  inboundEmail.customer?.name ||
  inboundEmail.customer?.documentNumber ||
  inboundEmail.customer?.cuil ||
  inboundEmail.customer?.email ||
  inboundEmail.customer?.phone
);

const hasAiAnalysis = computed(() =>
  inboundEmail.summary || inboundEmail.category || inboundEmail.sentiment || inboundEmail.priority || inboundEmail.tags?.length
);
</script>

<template>
  <div class="iev">

    <!-- ── COMPACT EMAIL HEADER ── -->
    <div class="iev-email-header">
      <h2 class="iev-subject">{{ inboundEmail.subject || 'Sin asunto' }}</h2>

      <div class="iev-from-line">
        <v-avatar color="primary" size="32" variant="tonal">
          <v-icon icon="mdi-account-outline" size="18" />
        </v-avatar>
        <div class="iev-from-line__detail">
          <span class="iev-from-line__name">{{ inboundEmail.fromName || inboundEmail.fromEmail || emptyValue }}</span>
          <span v-if="inboundEmail.fromName && inboundEmail.fromEmail" class="iev-from-line__email">&lt;{{ inboundEmail.fromEmail }}&gt;</span>
        </div>
        <span class="iev-from-line__date">{{ formatDateTime(inboundEmail.receivedAt) }}</span>
      </div>

      <div v-if="inboundEmail.toEmails?.length" class="iev-to-line">
        <span class="iev-to-line__label">Para:</span>
        <v-chip v-for="e in inboundEmail.toEmails" :key="e" size="x-small" variant="tonal" color="primary">{{ e }}</v-chip>
      </div>

      <div v-if="inboundEmail.ccEmails?.length" class="iev-to-line">
        <span class="iev-to-line__label">CC:</span>
        <v-chip v-for="e in inboundEmail.ccEmails" :key="e" size="x-small" variant="tonal">{{ e }}</v-chip>
      </div>

      <div v-if="inboundEmail.replyToEmail" class="iev-to-line">
        <span class="iev-to-line__label">Reply-to:</span>
        <span class="text-body-2">{{ inboundEmail.replyToEmail }}</span>
      </div>

      <!-- Status badges inline -->
      <div class="iev-badges">
        <v-chip :color="processingColor" variant="tonal" size="x-small" label>
          {{ dv(inboundEmail.processingStatus) }}
        </v-chip>
<!--        <v-chip v-if="inboundEmail.reviewStatus" :color="reviewColor" variant="tonal" size="x-small" label>-->
<!--          {{ inboundEmail.reviewStatus }}-->
<!--        </v-chip>-->
        <v-chip v-if="inboundEmail.isDuplicate" color="grey" variant="tonal" size="x-small" label prepend-icon="mdi-content-duplicate">
          Duplicado
        </v-chip>
      </div>
    </div>



    <!-- ── EMAIL BODY (collapsible, HTML first) ── -->
    <v-expansion-panels v-if="hasBodyContent" variant="accordion" class="iev-collapsed-section">
      <v-expansion-panel v-if="inboundEmail.bodyHtml" rounded="lg">
        <v-expansion-panel-title class="text-body-2">
          <v-icon icon="mdi-language-html5" size="18" class="mr-2" />
          Contenido HTML
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="iev-body-scroll" v-html="inboundEmail.bodyHtml" />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel v-if="inboundEmail.bodyText" rounded="lg">
        <v-expansion-panel-title class="text-body-2">
          <v-icon icon="mdi-text" size="18" class="mr-2" />
          Contenido Texto
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="iev-body-scroll iev-body-scroll--pre">{{ inboundEmail.bodyText }}</div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- ── ATTACHMENTS + OCR (grouped) ── -->
    <div v-if="inboundEmail.attachments?.length || inboundEmail.attachmentsOcrText" class="iev-section">
      <div class="iev-section__title">
        <v-icon icon="mdi-paperclip" size="18" class="mr-1" />
        Adjuntos
        <v-chip v-if="inboundEmail.attachments?.length" size="x-small" variant="tonal" color="primary" class="ml-2">
          {{ inboundEmail.attachments.length }}
        </v-chip>
      </div>

      <v-row v-if="inboundEmail.attachments?.length" dense class="iev-att-grid">
        <v-col
          v-for="att in (inboundEmail.attachments as InboundAttachment[])"
          :key="att.filepath"
          cols="12" sm="6" lg="4"
        >
          <div class="iev-att-compact">
            <div class="iev-att-compact__preview">
              <DraxImagePreview :image="att" small />
            </div>
            <div class="iev-att-compact__info">
              <div class="iev-att-compact__name" :title="att.filename">{{ att.filename }}</div>
              <div class="iev-att-compact__size">{{ formatFileSize(att.size) }}</div>
            </div>
          </div>
        </v-col>
      </v-row>



      <!-- OCR text from attachments (collapsible) -->
      <v-expansion-panels v-if="inboundEmail.attachmentsOcrText" variant="accordion" class="iev-collapsed-section mt-3">
        <v-expansion-panel rounded="lg">
          <v-expansion-panel-title class="text-body-2">
            <v-icon icon="mdi-ocr" size="18" class="mr-2" />
            Texto OCR de adjuntos
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="iev-body-scroll iev-body-scroll--pre">{{ inboundEmail.attachmentsOcrText }}</div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- ── AI ANALYSIS ── -->
    <v-card v-if="hasAiAnalysis" variant="flat" class="iev-card" rounded="lg">
      <div class="iev-card__header">
        <v-icon icon="mdi-robot-outline" size="18" class="mr-2" />
        Análisis IA
      </div>
      <div class="iev-ai-section">

        <div v-if="inboundEmail.category" class="iev-ai-row">
          <span class="iev-ai-row__label">Categoría</span>
          <span class="iev-ai-row__value">{{ inboundEmail.category }}</span>
        </div>
        <div v-if="inboundEmail.sentiment" class="iev-ai-row">
          <span class="iev-ai-row__label">Sentimiento</span>
          <v-chip :color="sentimentColor" variant="tonal" size="small">{{ inboundEmail.sentiment }}</v-chip>
        </div>
        <div v-if="inboundEmail.priority" class="iev-ai-row">
          <span class="iev-ai-row__label">Prioridad</span>
          <v-chip :color="priorityColor" variant="tonal" size="small">{{ inboundEmail.priority }}</v-chip>
        </div>
        <div v-if="inboundEmail.tags?.length" class="iev-ai-row">
          <span class="iev-ai-row__label">Etiquetas</span>
          <div class="d-flex flex-wrap ga-1">
            <v-chip v-for="tag in inboundEmail.tags" :key="tag" variant="tonal" size="small">{{ tag }}</v-chip>
          </div>
        </div>
        <div v-if="inboundEmail.summary" class="iev-ai-row">
          <span class="iev-ai-row__label">Resumen</span>
          <span class="iev-ai-row__value">{{ inboundEmail.summary }}</span>
        </div>
        <div v-if="inboundEmail.aiModel" class="iev-ai-row">
          <span class="iev-ai-row__label">Modelo</span>
          <span class="iev-ai-row__value text-medium-emphasis">{{ inboundEmail.aiModel }}</span>
        </div>
      </div>
    </v-card>

    <!-- ── EXTRACTED DATA ── -->
    <div v-if="hasCustomerData || hasExtractedEntities" class="iev-section">
      <div class="iev-section__title">
        <v-icon icon="mdi-database-search-outline" size="18" class="mr-1" />
        Datos extraídos
      </div>

      <v-row dense>
        <v-col v-if="hasCustomerData" cols="12" md="6">
          <v-card variant="flat" class="iev-card" rounded="lg">
            <div class="iev-card__header">
              <v-icon icon="mdi-account-outline" size="18" class="mr-2" />
              Cliente detectado
            </div>
            <div class="iev-kv-list">
              <div class="iev-kv" v-if="inboundEmail.customer?.name">
                <span class="iev-kv__label">Nombre</span>
                <span class="iev-kv__value">{{ inboundEmail.customer.name }}</span>
              </div>
              <div class="iev-kv" v-if="inboundEmail.customer?.documentNumber">
                <span class="iev-kv__label">Documento</span>
                <span class="iev-kv__value">{{ inboundEmail.customer.documentNumber }}</span>
              </div>
              <div class="iev-kv" v-if="inboundEmail.customer?.cuil">
                <span class="iev-kv__label">CUIL</span>
                <span class="iev-kv__value">{{ inboundEmail.customer.cuil }}</span>
              </div>
              <div class="iev-kv" v-if="inboundEmail.customer?.email">
                <span class="iev-kv__label">Email</span>
                <span class="iev-kv__value">{{ inboundEmail.customer.email }}</span>
              </div>
              <div class="iev-kv" v-if="inboundEmail.customer?.phone">
                <span class="iev-kv__label">Teléfono</span>
                <span class="iev-kv__value">{{ inboundEmail.customer.phone }}</span>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col v-if="hasExtractedEntities" cols="12" :md="hasCustomerData ? 6 : 12">
          <v-card variant="flat" class="iev-card" rounded="lg">
            <div class="iev-card__header">
              <v-icon icon="mdi-text-search-variant" size="18" class="mr-2" />
              Entidades
            </div>
            <v-table density="compact" class="iev-table">
              <thead>
                <tr>
                  <th>Etiqueta</th>
                  <th>Valor</th>
                  <th>Fuente</th>
                  <th>Confianza</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ent, i) in inboundEmail.extractedEntities" :key="i">
                  <td class="font-weight-medium">{{ ent.label }}</td>
                  <td>{{ dv(ent.value) }}</td>
                  <td>
                    <v-chip v-if="ent.source" size="x-small" variant="tonal" color="info">{{ ent.source }}</v-chip>
                    <span v-else class="text-medium-emphasis">{{ emptyValue }}</span>
                  </td>
                  <td>
                    <div v-if="ent.confidence != null" class="d-flex align-center ga-2">
                      <v-progress-linear
                        :model-value="confidencePct(ent.confidence)"
                        :color="ent.confidence >= 0.8 ? 'success' : ent.confidence >= 0.5 ? 'warning' : 'error'"
                        height="6" rounded style="max-width:70px"
                      />
                      <span class="text-caption">{{ confidencePct(ent.confidence) }}%</span>
                    </div>
                    <span v-else class="text-medium-emphasis">{{ emptyValue }}</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- ── NORMALIZED TEXT (collapsed) ── -->
    <v-expansion-panels v-if="inboundEmail.normalizedText" variant="accordion" class="iev-collapsed-section">
      <v-expansion-panel rounded="lg">
        <v-expansion-panel-title class="text-body-2">
          <v-icon icon="mdi-format-align-left" size="18" class="mr-2" />
          Texto normalizado
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="iev-body-scroll iev-body-scroll--pre">{{ inboundEmail.normalizedText }}</div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- ── METADATA (collapsed) ── -->
    <v-expansion-panels variant="accordion" class="iev-collapsed-section">
      <v-expansion-panel rounded="lg">
        <v-expansion-panel-title class="text-body-2">
          <v-icon icon="mdi-information-outline" size="18" class="mr-2" />
          Metadatos y trazabilidad
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="iev-kv-list">
            <div class="iev-kv">
              <span class="iev-kv__label">Message ID</span>
              <span class="iev-kv__value iev-kv__value--mono">{{ dv(inboundEmail.messageId) }}</span>
            </div>
            <div class="iev-kv">
              <span class="iev-kv__label">Thread ID</span>
              <span class="iev-kv__value iev-kv__value--mono">{{ dv(inboundEmail.threadId) }}</span>
            </div>
            <div class="iev-kv" v-if="inboundEmail.isDuplicate && inboundEmail.duplicateOfMessageId">
              <span class="iev-kv__label">Duplicado de</span>
              <span class="iev-kv__value iev-kv__value--mono">{{ inboundEmail.duplicateOfMessageId }}</span>
            </div>
            <div class="iev-kv">
              <span class="iev-kv__label">Canal</span>
              <span class="iev-kv__value">{{ dv(inboundEmail.sourceChannel) }}</span>
            </div>
            <div class="iev-kv">
              <span class="iev-kv__label">Buzón</span>
              <span class="iev-kv__value">{{ dv(inboundEmail.mailbox) }}</span>
            </div>
            <div class="iev-kv">
              <span class="iev-kv__label">Adjuntos</span>
              <span class="iev-kv__value">{{ formatBoolean(inboundEmail.hasAttachments) }} ({{ dv(inboundEmail.attachmentCount) }})</span>
            </div>
            <div class="iev-kv">
              <span class="iev-kv__label">Procesado</span>
              <span class="iev-kv__value">{{ formatDateTime(inboundEmail.processedAt) }}</span>
            </div>
            <div class="iev-kv">
              <span class="iev-kv__label">Creado</span>
              <span class="iev-kv__value">{{ formatDateTime(inboundEmail.createdAt) }}</span>
            </div>
            <div class="iev-kv">
              <span class="iev-kv__label">Actualizado</span>
              <span class="iev-kv__value">{{ formatDateTime(inboundEmail.updatedAt) }}</span>
            </div>
          </div>

        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

  </div>
</template>

<style scoped>
.iev {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ─── Email Header (compact) ─── */
.iev-email-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.iev-subject {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
}

.iev-from-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.iev-from-line__detail {
  flex: 1;
  min-width: 0;
}

.iev-from-line__name {
  font-weight: 600;
  font-size: 0.9rem;
}

.iev-from-line__email {
  margin-left: 4px;
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.iev-from-line__date {
  flex-shrink: 0;
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.iev-to-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding-left: 42px;
}

.iev-to-line__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.5);
  min-width: 55px;
}

.iev-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-left: 42px;
}

/* ─── Cards ─── */
.iev-card {
  background: rgba(var(--v-theme-surface-variant), 0.18);
  overflow: hidden;
}

.iev-card__header {
  display: flex;
  align-items: center;
  padding: 12px 16px 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
}



/* ─── AI Analysis ─── */
.iev-ai-section {
  display: flex;
  flex-direction: column;
  padding: 0 16px 14px;
}

.iev-ai-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.iev-ai-row:last-child {
  border-bottom: none;
}

.iev-ai-row__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.5);
  min-width: 80px;
  flex-shrink: 0;
  padding-top: 2px;
}

.iev-ai-row__value {
  font-size: 0.875rem;
  line-height: 1.5;
}

/* ─── Body scroll ─── */
.iev-body-scroll {
  padding: 16px;
  font-size: 0.875rem;
  line-height: 1.6;
  max-height: 350px;
  overflow-y: auto;
  word-break: break-word;
}

.iev-body-scroll--pre {
  white-space: pre-wrap;
}

/* ─── Sections ─── */
.iev-section__title {
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

/* ─── Compact Attachments ─── */
.iev-att-grid {
  margin-top: -4px;
}

.iev-att-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(var(--v-theme-surface-variant), 0.18);
}

.iev-att-compact__preview {
  position: relative;
  width: 56px;
  min-width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.iev-att-compact__open {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0.85;
  z-index: 1;
}

.iev-att-compact__open:hover {
  opacity: 1;
}

.iev-att-compact__info {
  min-width: 0;
  flex: 1;
}

.iev-att-compact__name {
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  word-break: break-word;
}

.iev-att-compact__size {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-top: 3px;
}

.iev-att-compact :deep(.drax-image-preview) {
  width: 100%;
  height: 100%;
}

.iev-att-compact :deep(.drax-image-preview img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ─── Key-Value list ─── */
.iev-kv-list {
  display: flex;
  flex-direction: column;
  padding: 0 16px 12px;
}

.iev-kv {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.iev-kv:last-child {
  border-bottom: none;
}

.iev-kv__label {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  flex-shrink: 0;
  min-width: 90px;
}

.iev-kv__value {
  font-size: 0.85rem;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  min-width: 0;
}

.iev-kv__value--mono {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.76rem;
  font-weight: 400;
}

/* ─── Table ─── */
.iev-table {
  background: transparent !important;
}

/* ─── Collapsed sections ─── */
.iev-collapsed-section {
  opacity: 0.9;
}

/* ─── Raw JSON ─── */
.iev-raw-json {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.76rem;
  font-family: 'Roboto Mono', monospace;
  margin: 0;
  max-height: 350px;
  overflow-y: auto;
}

@media (max-width: 599px) {
  .iev-from-line {
    flex-wrap: wrap;
  }
  .iev-from-line__date {
    width: 100%;
    padding-left: 42px;
  }
  .iev-to-line,
  .iev-badges {
    padding-left: 0;
  }
  .iev-kv {
    flex-direction: column;
    gap: 2px;
  }
  .iev-kv__value {
    text-align: left;
  }
}
</style>
