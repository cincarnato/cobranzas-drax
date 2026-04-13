
<script setup lang="ts">
import AffiliateTypeCrud from '../../cruds/AffiliateTypeCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="AffiliateTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>

