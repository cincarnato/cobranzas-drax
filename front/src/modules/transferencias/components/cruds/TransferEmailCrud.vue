
<script setup lang="ts">
import TransferEmailCrud from '../../cruds/TransferEmailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import TransferEmail from "@/modules/transferencias/components/TransferEmail.vue";

</script>

<template>
  <crud :entity="TransferEmailCrud.instance">
    <template v-slot:item.inboundEmail="{value}">{{value?.messageId}}</template>
    <template v-slot:item.transferDate="{value}">{{formatDate(value)}}</template>

    <template v-slot:form="{form, operation}">
      <transfer-email
        v-if="operation === 'view' || operation === 'edit'"
        :transfer-email="form"
        :readonly="operation === 'view'"
      />
    </template>

  </crud>
</template>

<style scoped>

</style>
