
<script setup lang="ts">
import MailboxCrud from '../../cruds/MailboxCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="MailboxCrud.instance">
    <template v-slot:item.operators="{value}">{{ value.map(v => v.name).join(",") }}</template>
  </crud>
</template>

<style scoped>

</style>

