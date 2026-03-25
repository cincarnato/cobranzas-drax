
<script setup lang="ts">
import CallFailedTypeCrud from '../../cruds/CallFailedTypeCrud'
import {Crud, useCrudStore} from "@drax/crud-vue";
import {ColorCombobox} from "@drax/common-vue";

const store = useCrudStore(CallFailedTypeCrud.instance.name);

</script>

<template>
  <crud :entity="CallFailedTypeCrud.instance">


    <template v-slot:field.color>
      <color-combobox v-model="store.form['color']"></color-combobox>
    </template>
  </crud>
</template>

<style scoped>

</style>
