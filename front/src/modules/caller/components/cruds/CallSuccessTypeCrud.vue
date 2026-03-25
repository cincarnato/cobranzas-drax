
<script setup lang="ts">
import CallSuccessTypeCrud from '../../cruds/CallSuccessTypeCrud'
import {Crud, useCrudStore} from "@drax/crud-vue";
import {ColorCombobox} from "@drax/common-vue";

const store = useCrudStore(CallSuccessTypeCrud.instance.name);

</script>

<template>
  <crud :entity="CallSuccessTypeCrud.instance">

    <template v-slot:field.color>
      <color-combobox v-model="store.form['color']"></color-combobox>
    </template>

  </crud>
</template>

<style scoped>

</style>
