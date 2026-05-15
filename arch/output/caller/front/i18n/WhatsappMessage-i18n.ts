
const messages = {
  en: {
  
    whatsappmessage: {
          entity: 'WhatsApp message',
          menu: 'WhatsApp messages',
          crud: 'Manage WhatsApp messages',
          field:{
                       sentAt:'Sent at',
           user:'User',
           destinationNumber:'Destination number',
           template:'Template'
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
          entity: 'Mensaje de WhatsApp',
          menu: 'Mensajes de WhatsApp',
          crud: 'Gestionar mensajes de WhatsApp',
          field:{
                       sentAt:'Fecha y hora',
           user:'Usuario',
           destinationNumber:'Número de destino',
           template:'Template'
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
