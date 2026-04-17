
<script setup lang="ts">
import MailboxCrud from '../../cruds/MailboxCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="MailboxCrud.instance">

  </crud>
</template>

<style scoped>

</style>
