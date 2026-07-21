<script setup lang="ts">
import {computed} from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IOutboundEmail} from "@/modules/mail/interfaces/IOutboundEmail";

dayjs.extend(relativeTime)
dayjs.locale("es")

const props = defineProps<{
  email: IInboundEmail
  lastOutbound?: IOutboundEmail | null
}>()

const text = computed(() => {
  if (props.lastOutbound?.status === "FAILED") return "Error al enviar"
  if (props.lastOutbound?.status === "SENDING" || props.lastOutbound?.status === "QUEUED") return "Enviando"
  if (!props.email.replyCount) return "Sin respuesta"
  if (props.email.lastRepliedAt) return `Respondido ${dayjs(props.email.lastRepliedAt).fromNow()}`
  return "Respondido"
})

const color = computed(() => {
  if (props.lastOutbound?.status === "FAILED") return "error"
  if (!props.email.replyCount) return "warning"
  return "success"
})
</script>

<template>
  <v-chip :color="color" size="x-small" variant="tonal">
    {{ text }}
  </v-chip>
</template>
