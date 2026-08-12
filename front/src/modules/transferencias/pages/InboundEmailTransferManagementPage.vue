<script setup lang="ts">
import {computed} from "vue";
import {useRoute} from "vue-router";
import InboundEmailTransferManagement from "@/modules/transferencias/components/InboundEmailTransferManagement.vue";

const route = useRoute()

const inboundEmailId = computed(() => {
  const value = route.query.inboundEmail
  if (Array.isArray(value)) return value[0] ? String(value[0]) : ""
  return value ? String(value) : ""
})
</script>

<template>
  <InboundEmailTransferManagement :inbound-email-id="inboundEmailId" />
</template>
