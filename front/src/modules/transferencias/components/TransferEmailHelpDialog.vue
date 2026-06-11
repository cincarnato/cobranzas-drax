<script setup lang="ts">
const dialog = defineModel<boolean>({default: false})

const processSteps = [
  {
    title: '1. Lectura de mails entrantes',
    icon: 'mdi-email-search-outline',
    text: 'El proceso toma mails entrantes que ya fueron incorporados y procesados por el modulo de correo. Solo considera mails listos para analizar, puede filtrar por categoria de transferencias y los recorre por fecha de recepcion, de mas antiguo a mas nuevo.'
  },
  {
    title: '2. Control de duplicados e intentos',
    icon: 'mdi-shield-check-outline',
    text: 'Antes de crear una transferencia, busca si ya existe un registro con el mismo messageId o con el mismo mail entrante asociado. Si ya existe, lo marca como procesado y lo omite. Si falla, guarda la marca de error y reintenta hasta el maximo configurado.'
  },
  {
    title: '3. Extraccion con IA',
    icon: 'mdi-robot-outline',
    text: 'La IA recibe metadatos del mail, remitente, asunto, cuerpo, texto normalizado y OCR de adjuntos. Debe decidir si el mail es un comprobante o aviso de transferencia y extraer importes, moneda, fecha, numero de operacion, cuentas, CBU/CVU, alias, bancos y datos del pagador.'
  },
  {
    title: '4. Creacion de transferencias',
    icon: 'mdi-bank-transfer-in',
    text: 'Si el mail contiene una o mas transferencias, se crea un registro por cada item detectado. Si no parece ser comprobante de transferencia, el mail se marca como omitido para este proceso.'
  },
  {
    title: '5. Resolucion de Pagador / Afiliado',
    icon: 'mdi-account-switch-outline',
    text: 'Con los datos extraidos se busca un mapeo en Pagadores. Si encuentra una coincidencia, reemplaza o completa los datos del afiliado con los del pagador configurado. Si no encuentra mapeo, conserva los datos obtenidos del mail y marca la estrategia como EMAIL_DATA.'
  }
]

const mappingStrategies = [
  {
    name: 'EMAIL_FROM',
    detail: 'Compara el email del remitente o pagador detectado en el mail.'
  },
  {
    name: 'DNI_CUIL',
    detail: 'Compara el DNI extraido del mail, del cliente detectado o del CUIL cuando se puede separar el DNI.'
  },
  {
    name: 'CBU_CVU',
    detail: 'Compara el CBU/CVU de origen de la transferencia.'
  },
  {
    name: 'NRO_CUENTA',
    detail: 'Compara el numero de cuenta de origen.'
  }
]
</script>

<template>
  <v-dialog v-model="dialog" max-width="920" scrollable>
    <v-card>
      <v-card-title class="transfer-help-title">
        <div class="transfer-help-title__icon">
          <v-icon icon="mdi-help-circle-outline" size="24" />
        </div>
        <div>
          <div class="transfer-help-title__main">Ayuda del modulo de transferencias</div>
          <div class="transfer-help-title__subtitle">
            Guia operativa para entender como se crean, revisan y reprocesan las transferencias.
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="transfer-help">
        <section class="transfer-help-section">
          <h3>Resumen del flujo</h3>
          <p>
            El modulo convierte mails entrantes en registros de transferencias. Primero localiza mails
            pendientes de analisis, luego usa IA para extraer la informacion bancaria y finalmente intenta
            resolver a que afiliado corresponde cada pago usando los mapeos cargados en Pagadores.
          </p>
        </section>

        <section class="transfer-help-section">
          <h3>Como se procesa un mail</h3>
          <div class="transfer-help-steps">
            <article
              v-for="step in processSteps"
              :key="step.title"
              class="transfer-help-step"
            >
              <v-icon :icon="step.icon" color="primary" size="22" />
              <div>
                <h4>{{ step.title }}</h4>
                <p>{{ step.text }}</p>
              </div>
            </article>
          </div>
        </section>

        <section class="transfer-help-section">
          <h3>Que datos extrae la IA</h3>
          <p>
            La IA intenta completar importe, moneda, fecha de transferencia, numero de operacion,
            concepto, cuenta/CBU/alias/banco de origen, cuenta/CBU/alias/banco de destino y datos del
            pagador o remitente. Tambien puede detectar afiliados adicionales cuando una misma
            transferencia paga a mas de una persona.
          </p>
          <v-alert type="info" variant="tonal" density="comfortable" class="mt-3">
            La IA no deberia inventar datos. Cuando un dato no aparece o es ambiguo, queda vacio y el
            registro puede quedar marcado para revision humana.
          </v-alert>
        </section>

        <section class="transfer-help-section">
          <h3>Mapeos de Pagador / Afiliado</h3>
          <p>
            Los Pagadores permiten traducir datos del comprobante a un afiliado concreto. El proceso busca
            coincidencias en este orden de prioridad:
          </p>

          <div class="transfer-help-strategies">
            <div
              v-for="strategy in mappingStrategies"
              :key="strategy.name"
              class="transfer-help-strategy"
            >
              <v-chip color="primary" variant="tonal" size="small">{{ strategy.name }}</v-chip>
              <span>{{ strategy.detail }}</span>
            </div>
          </div>

          <p class="mt-3">
            Si un Pagador coincide, se toman de ese mapeo el nombre, email, DNI del afiliado y afiliados
            adicionales si fueron cargados. Si no hay coincidencia, se conserva lo que se pudo leer del
            mail y se muestra la estrategia <strong>EMAIL_DATA</strong>.
          </p>
        </section>

        <section class="transfer-help-section">
          <h3>Revision humana</h3>
          <p>
            Un registro puede requerir revision cuando faltan datos criticos o cuando la IA detecta
            ambiguedad. Los datos criticos son importe, fecha de transferencia y DNI del afiliado. La
            columna "Revisar" ayuda a priorizar estos casos.
          </p>
        </section>

        <section class="transfer-help-section">
          <h3>Reprocesar transferencia</h3>
          <p>
            La accion de reprocesar no vuelve a invocar la IA. Toma la transferencia ya creada y vuelve a
            consultar los mapeos actuales de Pagadores usando email, DNI, CBU/CVU y numero de cuenta.
          </p>
          <p>
            Esta opcion es util cuando un operador cargo o corrigio un Pagador despues de que la
            transferencia fue creada. Al reprocesar, el sistema puede actualizar afiliado, email, DNI,
            estrategia, afiliados adicionales y fecha de proceso. Tambien recalcula si sigue faltando
            informacion critica para revision.
          </p>
        </section>

        <section class="transfer-help-section">
          <h3>Estados del mail entrante</h3>
          <p>
            El proceso deja una marca sobre el mail entrante con clave <strong>transfer-email</strong>.
            Esa marca puede indicar procesamiento en curso, exito, omitido o error. En caso de error se
            guarda el motivo para diagnostico y se respeta el limite de reintentos configurado.
          </p>
        </section>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="dialog = false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.transfer-help-title {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  padding: 18px 22px;
}

.transfer-help-title__icon {
  align-items: center;
  background: rgba(var(--v-theme-primary), 0.12);
  border-radius: 8px;
  color: rgb(var(--v-theme-primary));
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.transfer-help-title__main {
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.3;
}

.transfer-help-title__subtitle {
  color: rgba(var(--v-theme-on-surface), 0.66);
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.35;
  margin-top: 2px;
  white-space: normal;
}

.transfer-help {
  display: grid;
  gap: 18px;
  padding: 20px 22px 24px;
}

.transfer-help-section {
  display: grid;
  gap: 8px;
}

.transfer-help-section h3 {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  margin: 0;
}

.transfer-help-section p {
  color: rgba(var(--v-theme-on-surface), 0.76);
  line-height: 1.55;
  margin: 0;
}

.transfer-help-steps {
  display: grid;
  gap: 10px;
}

.transfer-help-step {
  border: 1px solid rgba(var(--v-theme-outline), 0.24);
  border-radius: 8px;
  display: grid;
  gap: 10px;
  grid-template-columns: 28px 1fr;
  padding: 12px;
}

.transfer-help-step h4 {
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.35;
  margin: 0 0 3px;
}

.transfer-help-step p {
  font-size: 0.9rem;
}

.transfer-help-strategies {
  display: grid;
  gap: 8px;
  margin-top: 4px;
}

.transfer-help-strategy {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 118px 1fr;
}

.transfer-help-strategy span {
  color: rgba(var(--v-theme-on-surface), 0.76);
  line-height: 1.45;
}

@media (max-width: 700px) {
  .transfer-help-title {
    padding: 16px;
  }

  .transfer-help {
    padding: 16px;
  }

  .transfer-help-strategy {
    align-items: flex-start;
    grid-template-columns: 1fr;
  }
}
</style>
