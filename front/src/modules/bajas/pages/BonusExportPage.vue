<script setup lang="ts">
import {ref} from 'vue'
import {CrudAutocomplete} from '@drax/crud-vue'
import {UserCrud} from '@drax/identity-vue'
import type {IEntityCrudField} from '@drax/crud-share'
import BonusProvider from '../providers/BonusProvider'

const formRef = ref()
const loading = ref(false)
const error = ref('')
const success = ref('')
const form = ref({
  from: getTodayDate(),
  to: getTodayDate(),
  operator: undefined as string | undefined,
})
const requiredRule = (value: unknown) => !!value || 'Requerido'
const operatorField: IEntityCrudField = {
  default: undefined,
  label: 'Operador',
  name: 'operator',
  type: 'ref'
}

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function resolveFileName(response: Response) {
  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const match = contentDisposition.match(/filename=\"?([^"]+)\"?/)
  return match?.[1] ?? `bonificaciones_${form.value.from}_${form.value.to}.xlsx`
}

function startOfDay(date: string) {
  return new Date(`${date}T00:00:00`).toISOString()
}

function endOfDay(date: string) {
  return new Date(`${date}T23:59:59.999`).toISOString()
}

async function exportExcel() {
  error.value = ''
  success.value = ''

  const result = await formRef.value?.validate()
  if (!result?.valid) {
    return
  }

  loading.value = true

  try {
    const response = await BonusProvider.instance.exportExcel(
      startOfDay(form.value.from),
      endOfDay(form.value.to),
      form.value.operator
    )

    if (!response.ok) {
      let message = 'No se pudo exportar el archivo.'

      try {
        const body = await response.json()
        message = body?.message ?? message
      } catch {
        // ignore invalid json error bodies
      }

      throw new Error(message)
    }

    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = resolveFileName(response)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)

    success.value = 'El archivo Excel se genero correctamente.'
  } catch (e: any) {
    error.value = e?.message ?? 'Ocurrio un error al exportar.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-item>
            <v-card-title>Exportar bonificaciones</v-card-title>
          </v-card-item>

          <v-card-text>
            <v-form ref="formRef" @submit.prevent="exportExcel">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.from"
                    label="Desde"
                    type="date"
                    variant="outlined"
                    :rules="[requiredRule]"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.to"
                    label="Hasta"
                    type="date"
                    variant="outlined"
                    :rules="[requiredRule]"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12">
                  <CrudAutocomplete
                    v-model="form.operator"
                    :field="operatorField"
                    :entity="UserCrud.instance"
                    variant="outlined"
                    :hide-details="true"
                  />
                </v-col>

                <v-col cols="12">
                  <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ error }}
                  </v-alert>

                  <v-alert
                    v-if="success"
                    type="success"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ success }}
                  </v-alert>

                  <div class="d-flex justify-end">
                    <v-btn
                      color="primary"
                      :loading="loading"
                      prepend-icon="mdi-file-excel-outline"
                      @click="exportExcel"
                    >
                      Exportar Excel
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
