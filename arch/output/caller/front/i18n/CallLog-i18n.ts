
const messages = {
  en: {
  
    calllog: {
          entity: 'CallLog',
          menu: 'CallLog',
          crud: 'Manage CallLog',
          field:{
                       callList:'callList',
           attempts:'attempts',
           notes:'notes',
           typification:'typification',
           state:'state',
           promiseDate:'promiseDate',
           done:'done',
           data:'data'
          }
      },
      permission: {
              'calllog:view': 'View CallLog',
              'calllog:create': 'Create CallLog',
              'calllog:update': 'Edit CallLog',
              'calllog:delete': 'Delete CallLog',
              'calllog:manage': 'Manage CallLog',
      }
  },
  es: {
     calllog: {
          entity: 'CallLog',
          menu: 'CallLog',
          crud: 'Gestionar CallLog',
          field:{
                       callList:'callList',
           attempts:'attempts',
           notes:'notes',
           typification:'typification',
           state:'state',
           promiseDate:'promiseDate',
           done:'done',
           data:'data'
          }
      },
     permission: {
              'calllog:view': 'Ver CallLog',
              'calllog:create': 'Crear CallLog',
              'calllog:update': 'Editar CallLog',
              'calllog:delete': 'Eliminar CallLog',
              'calllog:manage': 'Gestionar CallLog',
     }
  }
}

export default messages;  
