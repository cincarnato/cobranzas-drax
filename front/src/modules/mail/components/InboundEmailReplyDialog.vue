<script setup lang="ts">
import {computed} from "vue";
import type {IInboundEmail} from "@/modules/mail/interfaces/IInboundEmail";
import InboundEmailReplyComposer from "@/modules/mail/components/InboundEmailReplyComposer.vue";
import type {MailReplyResult, MailSendResult} from "@/modules/mail/providers/MailReplyProvider";

const props = defineProps<{
  modelValue: boolean
  inboundEmail: IInboundEmail | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'sent', value: MailReplyResult): void
  (e: 'cancel'): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function onSent(result: MailReplyResult | MailSendResult) {
  if (!('inboundEmail' in result)) return
  emit('sent', result)
  dialog.value = false
}

function onCancel() {
  emit('cancel')
  dialog.value = false
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="820" persistent>
    <InboundEmailReplyComposer
      v-if="dialog"
      :inbound-email="inboundEmail"
      @sent="onSent"
      @cancel="onCancel"
    />
  </v-dialog>
</template>
