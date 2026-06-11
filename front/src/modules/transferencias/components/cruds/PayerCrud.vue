
<script setup lang="ts">
import {Crud} from "@drax/crud-vue";
import PayerCrud from '../../cruds/PayerCrud'

</script>

<template>
  <crud :entity="PayerCrud.instance" />
</template>

<style scoped>

</style>
