<script setup lang="ts">
import {computed, ref} from "vue";
import dayjs from "dayjs";
import type {EmailThreadEntry} from "@/modules/mail/interfaces/IEmailManagement";
import EmailAttachments from "./EmailAttachments.vue";

const props = defineProps<{entry: EmailThreadEntry}>()
const showRemote = ref(false)

const title = computed(() => props.entry.type === "INBOUND"
  ? (props.entry.inboundEmail?.fromName || props.entry.inboundEmail?.fromEmail || "Entrante")
  : (props.entry.outboundEmail?.fromEmail || "Saliente"))

const recipients = computed(() => props.entry.type === "INBOUND"
  ? (props.entry.inboundEmail?.toEmails || []).join(", ")
  : (props.entry.outboundEmail?.toEmails || []).join(", "))

const bodyHtml = computed(() => {
  const html = props.entry.type === "INBOUND" ? props.entry.inboundEmail?.bodyHtml : props.entry.outboundEmail?.bodyHtml
  const text = props.entry.type === "INBOUND" ? props.entry.inboundEmail?.bodyText : props.entry.outboundEmail?.bodyText
  return sanitizeHtml(html || escapeHtml(text || "").replace(/\n/g, "<br>"), showRemote.value)
})

const outbound = computed(() => props.entry.outboundEmail)

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
    <v-card-title class="d-flex align-center ga-2 py-3">
      <v-icon :icon="entry.type === 'INBOUND' ? 'mdi-email-arrow-left-outline' : 'mdi-email-arrow-right-outline'" />
      <div class="min-w-0">
        <div class="text-subtitle-2 text-truncate">{{ title }}</div>
        <div class="text-caption text-medium-emphasis text-truncate">Para: {{ recipients || '-' }}</div>
      </div>
      <v-spacer />
      <div class="text-caption text-medium-emphasis">{{ dayjs(entry.date).format('DD/MM/YYYY HH:mm') }}</div>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-alert v-if="outbound?.status === 'FAILED'" type="error" variant="tonal" density="compact" class="mb-3">
        Error al enviar. Intentos: {{ outbound.attempts || 0 }}. {{ outbound.lastError }}
      </v-alert>
      <v-btn v-if="!showRemote" size="small" variant="text" prepend-icon="mdi-image-off-outline" class="mb-2" @click="showRemote = true">
        Mostrar contenido remoto
      </v-btn>
      <div class="email-body" v-html="bodyHtml" />
      <EmailAttachments :attachments="entry.inboundEmail?.attachments" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.email-body {
  overflow-wrap: anywhere;
}
.email-body :deep(img) {
  max-width: 100%;
}
</style>
