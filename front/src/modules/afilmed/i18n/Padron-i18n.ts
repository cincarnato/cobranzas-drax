
const messages = {
  en: {
  
    padron: {
          entity: 'Padron',
          menu: 'Padron',
          crud: 'Manage Padron',
          importMenu: 'Import Padron',
          import: {
            title: 'Import Padron',
            warning: 'The uploaded file replaces every existing Padron record.',
            file: 'XLSX or CSV file',
            confirm: 'I understand that the current Padron will be replaced.',
            submit: 'Import',
            success: 'Imported {count} records.',
            error: 'The Padron could not be imported.'
          },
          field:{
                       origen:'origen',
           ente:'ente',
           contra:'contra',
           ape_nom:'ape_nom',
           cant_inte:'cant_inte',
           plan_codi:'plan_codi',
           domicilio:'domicilio',
           loca:'loca',
           tele:'tele',
           deuda1:'deuda1',
           deuda2:'deuda2',
           deuda3:'deuda3',
           deuda4:'deuda4',
           periodo1:'periodo1',
           periodo2:'periodo2',
           periodo3:'periodo3',
           periodo4:'periodo4',
           subtotal:'subtotal',
           pago_forma:'pago_forma',
           cobrador:'cobrador',
           total_ctacte:'total_ctacte',
           baja_fecha:'baja_fecha',
           nro_ref_elect:'nro_ref_elect',
           celular:'celular',
           deno_provin:'deno_provin',
           alias:'alias',
           cbu_siro:'cbu_siro'
          }
      },
      permission: {
              'padron:view': 'View Padron',
              'padron:create': 'Create Padron',
              'padron:update': 'Edit Padron',
              'padron:delete': 'Delete Padron',
              'padron:manage': 'Manage Padron',
      }
  },
  es: {
     padron: {
          entity: 'Padron',
          menu: 'Padron',
          crud: 'Gestionar Padron',
          importMenu: 'Importar Padron',
          import: {
            title: 'Importar Padron',
            warning: 'El archivo subido reemplaza todos los registros existentes del Padron.',
            file: 'Archivo XLSX o CSV',
            confirm: 'Entiendo que se reemplazara el Padron actual.',
            submit: 'Importar',
            success: 'Se importaron {count} registros.',
            error: 'No se pudo importar el Padron.'
          },
          field:{
                       origen:'origen',
           ente:'ente',
           contra:'contra',
           ape_nom:'ape_nom',
           cant_inte:'cant_inte',
           plan_codi:'plan_codi',
           domicilio:'domicilio',
           loca:'loca',
           tele:'tele',
           deuda1:'deuda1',
           deuda2:'deuda2',
           deuda3:'deuda3',
           deuda4:'deuda4',
           periodo1:'periodo1',
           periodo2:'periodo2',
           periodo3:'periodo3',
           periodo4:'periodo4',
           subtotal:'subtotal',
           pago_forma:'pago_forma',
           cobrador:'cobrador',
           total_ctacte:'total_ctacte',
           baja_fecha:'baja_fecha',
           nro_ref_elect:'nro_ref_elect',
           celular:'celular',
           deno_provin:'deno_provin',
           alias:'alias',
           cbu_siro:'cbu_siro'
          }
      },
     permission: {
              'padron:view': 'Ver Padron',
              'padron:create': 'Crear Padron',
              'padron:update': 'Editar Padron',
              'padron:delete': 'Eliminar Padron',
              'padron:manage': 'Gestionar Padron',
     }
  }
}

export default messages;  
