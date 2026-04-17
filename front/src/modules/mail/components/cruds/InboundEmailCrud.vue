
<script setup lang="ts">
import InboundEmailCrud from '../../cruds/InboundEmailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import InboundEmailView from "@/modules/mail/components/InboundEmailView.vue";
</script>

<template>
  <crud :entity="InboundEmailCrud.instance">
    <template v-slot:item.receivedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.toEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.ccEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.processedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.hasAttachment="{value}">{{value ? 'si' : 'no'}}</template>


    <template v-slot:form="{form, operation}">
     <inbound-email-view v-if="operation === 'view'" :inbound-email="form" />
    </template>


  </crud>
</template>

<style scoped>
.attachments-field {
  width: 100%;
}

.attachments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.attachments-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.attachment-card {
  height: 100%;
  overflow: hidden;
}

.attachment-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.attachment-name {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.35;
  word-break: break-word;
}

.attachment-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 0.8rem;
}

.attachments-empty {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.9rem;
}
</style>
