
<script setup lang="ts">
import OutboundEmailCrud from '../../cruds/OutboundEmailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="OutboundEmailCrud.instance">
    <template v-slot:item.inboundEmail="{value}">{{value?.messageId}}</template>
    <template v-slot:item.mailbox="{value}">{{value?.email}}</template>
    <template v-slot:item.user="{value}">{{value?.name}}</template>
    <template v-slot:item.toEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.ccEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.bccEmails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.references="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.sentAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

