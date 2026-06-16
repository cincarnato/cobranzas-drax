
<script setup lang="ts">
import {computed} from "vue";
import {Crud, useCrudStore} from "@drax/crud-vue";
import {useI18n} from "vue-i18n";
import PayerCrud from '../../cruds/PayerCrud'

const entity = PayerCrud.instance
const store = useCrudStore(entity.name)
const {t} = useI18n()
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const strategyConfig = {
  EMAIL_FROM: {
    hint: 'Ingresa el email del remitente o del pagador detectado. Debe ser un mail valido.',
    placeholder: 'ejemplo@dominio.com',
    type: 'email'
  },
  DNI_CUIL: {
    hint: 'Ingresa el DNI o CUIL que se usara para detectar al pagador.',
    placeholder: '20301234567',
    type: 'text'
  },
  CBU_CVU: {
    hint: 'Ingresa el CBU o CVU de origen que debe coincidir con la transferencia.',
    placeholder: '0000003100000000000000',
    type: 'text'
  },
  NRO_CUENTA: {
    hint: 'Ingresa el numero de cuenta de origen que se va a comparar.',
    placeholder: '1234567890',
    type: 'text'
  }
} as const

const currentStrategyConfig = computed(() => {
  const strategy = store.form?.strategy as keyof typeof strategyConfig | undefined
  return strategyConfig[strategy || 'EMAIL_FROM']
})

const valueRules = computed(() => [
  (value: string) => !!String(value || '').trim() || t('validation.required'),
  (value: string) => {
    const strategy = store.form?.strategy
    if (strategy !== 'EMAIL_FROM') {
      return true
    }
    return EMAIL_REGEX.test(String(value || '').trim()) || 'Debe ser un email valido'
  }
])
</script>

<template>
  <crud :entity="entity">
    <template v-slot:field.value="{ field }">
      <v-text-field
        v-model="store.form[field.name]"
        :label="field.label"
        :hint="currentStrategyConfig.hint"
        :placeholder="currentStrategyConfig.placeholder"
        :rules="valueRules"
        :type="currentStrategyConfig.type"
        persistent-hint
      />
    </template>
  </crud>
</template>

<style scoped>

</style>
