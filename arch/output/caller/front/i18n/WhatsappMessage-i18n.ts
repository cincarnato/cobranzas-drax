
const messages = {
  en: {
  
    whatsappmessage: {
          entity: 'WhatsappMessage',
          menu: 'WhatsappMessage',
          crud: 'Manage WhatsappMessage',
          field:{
                       sentAt:'sentAt',
           user:'user',
           destinationNumber:'destinationNumber',
           template:'template'
          }
      },
      permission: {
              'whatsappmessage:view': 'View WhatsappMessage',
              'whatsappmessage:create': 'Create WhatsappMessage',
              'whatsappmessage:update': 'Edit WhatsappMessage',
              'whatsappmessage:delete': 'Delete WhatsappMessage',
              'whatsappmessage:manage': 'Manage WhatsappMessage',
      }
  },
  es: {
     whatsappmessage: {
          entity: 'WhatsappMessage',
          menu: 'WhatsappMessage',
          crud: 'Gestionar WhatsappMessage',
          field:{
                       sentAt:'sentAt',
           user:'user',
           destinationNumber:'destinationNumber',
           template:'template'
          }
      },
     permission: {
              'whatsappmessage:view': 'Ver WhatsappMessage',
              'whatsappmessage:create': 'Crear WhatsappMessage',
              'whatsappmessage:update': 'Editar WhatsappMessage',
              'whatsappmessage:delete': 'Eliminar WhatsappMessage',
              'whatsappmessage:manage': 'Gestionar WhatsappMessage',
     }
  }
}

export default messages;  
