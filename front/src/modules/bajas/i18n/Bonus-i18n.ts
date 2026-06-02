
const messages = {
  en: {

    bonus: {
          entity: 'Bonus',
          menu: 'Bonuses',
          exportMenu: 'Export Bonuses',
          crud: 'Manage Bonuses',
          field:{
                       createdAt:'createdAt',
           dni:'DNI',
           fullname:'Full name',
           plan:'Plan',
           appliedMonth:'Applies month',
           paymentMethod:'Payment method',
           bonus:'Bonus (%)',
           period:'Period',
           bonifiedNetValue:'Bonified net value',
           status:'Status',
           observation:'Observation',
           createdBy:'Operator'
          }
      },
      permission: {
              'bonus:view': 'View Bonus',
              'bonus:viewAll': 'View All Bonuses',
              'bonus:create': 'Create Bonus',
              'bonus:update': 'Edit Bonus',
              'bonus:delete': 'Delete Bonus',
              'bonus:export': 'Export Bonus',
              'bonus:manage': 'Manage Bonus',
      }
  },
  es: {
     bonus: {
          entity: 'Bonificacion',
          menu: 'Bonificaciones',
          exportMenu: 'Exportar bonificaciones',
          crud: 'Gestionar bonificaciones',
          field:{
                       createdAt:'Fecha de carga',
           dni:'DNI',
           fullname:'Nombre y apellido',
           plan:'Plan',
           appliedMonth:'Aplica (mes)',
           paymentMethod:'Forma de pago',
           bonus:'Bonificacion (%)',
           period:'Periodo',
           bonifiedNetValue:'Valor neto bonificado',
           status:'Estado',
           observation:'Observacion',
           createdBy:'Operador'
          }
      },
     permission: {
              'bonus:view': 'Ver bonificaciones',
              'bonus:viewAll': 'Ver todas las bonificaciones',
              'bonus:create': 'Crear bonificaciones',
              'bonus:update': 'Editar bonificaciones',
              'bonus:delete': 'Eliminar bonificaciones',
              'bonus:export': 'Exportar bonificaciones',
              'bonus:manage': 'Gestionar bonificaciones',
     }
  }
}

export default messages;
