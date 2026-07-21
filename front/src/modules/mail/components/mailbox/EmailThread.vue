<script setup lang="ts">
import {computed} from "vue";
import type {EmailThreadEntry} from "@/modules/mail/interfaces/IEmailManagement";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import type {IOutboundEmail} from "@/modules/mail/interfaces/IOutboundEmail";
import EmailThreadItem from "./EmailThreadItem.vue";

const props = defineProps<{
  inboundThread: IInboundEmail[]
  outboundThread: IOutboundEmail[]
}>()

const entries = computed<EmailThreadEntry[]>(() => [
  ...props.inboundThread.map((item) => ({id: item._id, type: "INBOUND" as const, date: item.receivedAt, inboundEmail: item})),
  ...props.outboundThread.map((item) => ({id: item._id, type: "OUTBOUND" as const, date: item.sentAt || item.createdAt || new Date(), outboundEmail: item})),
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
</script>

<template>
  <div>
    <EmailThreadItem v-for="entry in entries" :key="`${entry.type}-${entry.id}`" :entry="entry" />
  </div>
</template>
