<script setup lang="ts">
import {CrudAutocomplete} from "@drax/crud-vue";
import {UserCrud} from "@drax/identity-vue";
import type {IEntityCrudField} from "@drax/crud-share";
import type {PropType} from "vue";

const valueModel = defineModel<any>({type: [String, Array] as PropType<any>})

const {name, label} = defineProps({
  name: {type: String as PropType<string>, required: false},
  label: {type: String as PropType<string>, required: false},
  prependIcon: {type: String},
  prependInnerIcon: {type: String},
  appendIcon: {type: String},
  appendInnerIcon: {type: String},
  multiple: {type: Boolean, default: false},
  chips: {type: Boolean, default: false},
  closableChips: {type: Boolean, default: true},
  readonly: {type: Boolean, default: false},
  clearable: {type: Boolean, default: true},
  hint: {type: String},
  persistentHint: {type: Boolean, default: false},
  rules: {type: Array as PropType<any[]>, default: () => []},
  errorMessages: {type: Array as PropType<string[]>, default: () => []},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  addOnTheFly: {type: Boolean, default: false},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
})

const field: IEntityCrudField = {
  default: undefined,
  label: label || 'Usuario',
  name: name || 'user',
  type: 'ref'
}
</script>

<template>
  <crud-autocomplete
    v-model="valueModel"
    :field="field"
    :entity="UserCrud.instance"
    :hint="hint"
    :persistent-hint="persistentHint"
    :error-messages="errorMessages"
    :rules="rules"
    :density="density"
    :variant="variant"
    :readonly="readonly"
    :clearable="clearable"
    :hide-details="hideDetails"
    :single-line="singleLine"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    :prepend-inner-icon="prependInnerIcon"
    :append-inner-icon="appendInnerIcon"
    :add-on-the-fly="addOnTheFly"
    :multiple="multiple"
    :chips="chips"
    :closable-chips="closableChips"
  />
</template>
