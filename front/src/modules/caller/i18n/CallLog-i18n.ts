
const messages = {
  en: {
    calllog: {
          entity: 'Call Log',
          menu: 'Call Logs',
          crud: 'Manage Call Logs',
          field:{
                       callList:'Call List',
           attempts:'Attempts',
           notes:'Notes',
           typification:'Typification',
           state:'Status',
           promiseDate:'Promise Date',
           done:'Completed',
           data:'Data'
          }
      },
      permission: {
              'calllog:view': 'View Call Logs',
              'calllog:create': 'Create Call Logs',
              'calllog:update': 'Edit Call Logs',
              'calllog:delete': 'Delete Call Logs',
              'calllog:manage': 'Manage Call Logs',
      }
  },
  es: {
     calllog: {
          entity: 'Registro de llamadas',
          menu: 'Registros de llamadas',
          crud: 'Gestionar registros de llamadas',
          field:{
                       callList:'Lista de llamadas',
           attempts:'Intentos',
           notes:'Notas',
           typification:'Tipificacion',
           state:'Estado',
           promiseDate:'Fecha de promesa',
           done:'Completado',
           data:'Datos'
          }
      },
     permission: {
              'calllog:view': 'Ver registros de llamadas',
              'calllog:create': 'Crear registros de llamadas',
              'calllog:update': 'Editar registros de llamadas',
              'calllog:delete': 'Eliminar registros de llamadas',
              'calllog:manage': 'Gestionar registros de llamadas',
     }
  }
}

export default messages;  
