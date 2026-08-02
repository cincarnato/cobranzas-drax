
<script setup lang="ts">
import MailboxUserSettingCrud from '../../cruds/MailboxUserSettingCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="MailboxUserSettingCrud.instance">
    <template v-slot:item.mailbox="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.name}}</template>
  </crud>
</template>

<style scoped>

</style>
