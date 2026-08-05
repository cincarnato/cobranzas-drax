
const messages = {
  en: {
  
    templateemail: {
          entity: 'Prepared message',
          menu: 'Prepared messages',
          crud: 'Manage prepared messages',
          field:{
                       mailbox:'Mailbox',
           name:'Name',
           content:'Content'
          }
      },
      permission: {
              'templateemail:view': 'View prepared messages',
              'templateemail:create': 'Create prepared messages',
              'templateemail:update': 'Edit prepared messages',
              'templateemail:delete': 'Delete prepared messages',
              'templateemail:manage': 'Manage prepared messages',
      }
  },
  es: {
     templateemail: {
          entity: 'Mensaje preparado',
          menu: 'Mensajes preparados',
          crud: 'Gestionar mensajes preparados',
          field:{
                       mailbox:'Mailbox',
           name:'Nombre',
           content:'Contenido'
          }
      },
     permission: {
              'templateemail:view': 'Ver mensajes preparados',
              'templateemail:create': 'Crear mensajes preparados',
              'templateemail:update': 'Editar mensajes preparados',
              'templateemail:delete': 'Eliminar mensajes preparados',
              'templateemail:manage': 'Gestionar mensajes preparados',
     }
  }
}

export default messages;  
