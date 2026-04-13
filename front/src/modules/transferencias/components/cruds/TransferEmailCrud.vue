
<script setup lang="ts">
import TransferEmailCrud from '../../cruds/TransferEmailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import TransferEmailView from "@/modules/transferencias/components/TransferEmailView.vue";

</script>

<template>
  <crud :entity="TransferEmailCrud.instance">
    <template v-slot:item.inboundEmail="{value}">{{value?.messageId}}</template>
    <template v-slot:item.transferDate="{value}">{{formatDate(value)}}</template>

    <template v-slot:form="{form, operation}">
      <transfer-email-view v-if="operation === 'view'" :transfer-email="form"></transfer-email-view>
    </template>

  </crud>
</template>

<style scoped>

</style>

