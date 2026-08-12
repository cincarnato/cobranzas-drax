<script setup lang="ts">
import {computed, ref, watch} from "vue";
import dayjs from "dayjs";
import type {EmailThreadEntry} from "@/modules/mail/interfaces/IEmailManagement";
import EmailAttachments from "./EmailAttachments.vue";

const props = defineProps<{
  entry: EmailThreadEntry
  initialExpanded?: boolean
}>()
const showRemote = ref(false)
const expanded = ref(Boolean(props.initialExpanded))

watch(() => [props.entry.type, props.entry.id, props.initialExpanded], () => {
  expanded.value = Boolean(props.initialExpanded)
  showRemote.value = false
})

const senderName = computed(() => props.entry.type === "INBOUND"
  ? (props.entry.inboundEmail?.fromName || "")
  : "")

const senderEmail = computed(() => props.entry.type === "INBOUND"
  ? (props.entry.inboundEmail?.fromEmail || "")
  : (props.entry.outboundEmail?.fromEmail || ""))

const senderLabel = computed(() => {
  if (senderName.value && senderEmail.value) return `${senderName.value} <${senderEmail.value}>`
  return senderName.value || senderEmail.value || "-"
})

const directionColor = computed(() => props.entry.type === "INBOUND" ? "blue-darken-2" : "deep-orange-darken-2")
const directionClass = computed(() => props.entry.type === "INBOUND" ? "direction-inbound" : "direction-outbound")

const recipients = computed(() => props.entry.type === "INBOUND"
  ? (props.entry.inboundEmail?.toEmails || []).join(", ")
  : (props.entry.outboundEmail?.toEmails || []).join(", "))

const bodyHtml = computed(() => {
  const html = props.entry.type === "INBOUND" ? props.entry.inboundEmail?.bodyHtml : props.entry.outboundEmail?.bodyHtml
  const text = props.entry.type === "INBOUND" ? props.entry.inboundEmail?.bodyText : props.entry.outboundEmail?.bodyText
  return sanitizeHtml(html || escapeHtml(text || "").replace(/\n/g, "<br>"), showRemote.value)
})

const outbound = computed(() => props.entry.outboundEmail)
const attachments = computed(() => props.entry.type === "INBOUND"
  ? props.entry.inboundEmail?.attachments
  : props.entry.outboundEmail?.attachments)
const outboundAction = computed(() => {
  if (props.entry.type !== "OUTBOUND") return null
  if (props.entry.outboundEmail?.inboundEmail && !props.entry.outboundEmail?.inReplyTo) {
    return {
      label: "Reenvio",
      icon: "mdi-share-outline",
      color: "deep-purple",
    }
  }
  return {
    label: "Respuesta",
    icon: "mdi-reply-outline",
    color: "deep-orange-darken-2",
  }
})

function sanitizeHtml(value: string, allowRemote: boolean) {
  if (!value.trim()) return ""
  const template = document.createElement("template")
  template.innerHTML = value
  template.content.querySelectorAll("script, style, iframe, object, embed, meta, link").forEach((node) => node.remove())
  template.content.querySelectorAll("*").forEach((node) => {
    const element = node as HTMLElement
    const tag = element.tagName.toLowerCase()
    if (!["a", "b", "blockquote", "br", "div", "em", "font", "i", "li", "ol", "p", "span", "strong", "table", "tbody", "td", "th", "thead", "tr", "u", "ul"].includes(tag)) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const attrValue = attribute.value
      const safeHref = tag === "a" && name === "href" && /^(https?:|mailto:)/i.test(attrValue)
      const safeSrc = allowRemote && tag === "img" && name === "src" && /^https:\/\//i.test(attrValue)
      if (!safeHref && !safeSrc && name !== "style") element.removeAttribute(attribute.name)
      if (name.startsWith("on")) element.removeAttribute(attribute.name)
    })
  })
  return template.innerHTML
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}
</script>

<template>
  <v-card variant="outlined" class="mb-3">
    <v-card-title class="d-flex align-center ga-2 py-3 cursor-pointer" @click="expanded = !expanded">
      <div class="direction-icon" :class="directionClass">
        <v-icon
          :icon="entry.type === 'INBOUND' ? 'mdi-email-arrow-left-outline' : 'mdi-email-arrow-right-outline'"
          :color="directionColor"
          size="22"
        />
      </div>
      <div class="min-w-0">
        <div class="text-subtitle-2 text-truncate">De: {{ senderLabel }}</div>
        <div class="text-caption text-medium-emphasis text-truncate">Para: {{ recipients || '-' }}</div>
      </div>
      <v-spacer />
      <v-chip
        v-if="outboundAction"
        :prepend-icon="outboundAction.icon"
        :color="outboundAction.color"
        size="x-small"
        variant="tonal"
      >
        {{ outboundAction.label }}
      </v-chip>
      <v-icon
        v-if="attachments?.length"
        icon="mdi-paperclip"
        size="small"
        class="text-medium-emphasis"
      />
      <div class="text-caption text-medium-emphasis">{{ dayjs(entry.date).format('DD/MM/YYYY HH:mm') }}</div>
      <v-btn
        :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        variant="text"
        density="compact"
        @click.stop="expanded = !expanded"
      />
    </v-card-title>
    <template v-if="expanded">
      <v-divider />
      <v-card-text>
        <v-alert v-if="outbound?.status === 'FAILED'" type="error" variant="tonal" density="compact" class="mb-3">
          Error al enviar. Intentos: {{ outbound.attempts || 0 }}. {{ outbound.lastError }}
        </v-alert>
        <v-btn v-if="!showRemote" size="small" variant="text" prepend-icon="mdi-image-off-outline" class="mb-2" @click="showRemote = true">
          Mostrar contenido remoto
        </v-btn>
        <div class="email-body" v-html="bodyHtml" />
        <EmailAttachments :attachments="attachments" />
      </v-card-text>
    </template>
  </v-card>
</template>

<style scoped>
.direction-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
}
.direction-inbound {
  background: #e3f2fd;
  border: 1px solid #90caf9;
}
.direction-outbound {
  background: #fbe9e7;
  border: 1px solid #ffab91;
}
.email-body {
  overflow-wrap: anywhere;
}
.email-body :deep(img) {
  max-width: 100%;
}
</style>
