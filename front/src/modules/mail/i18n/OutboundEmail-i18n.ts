
const messages = {
  en: {
  
    outboundemail: {
          entity: 'Outbound Email',
          menu: 'Outbound Emails',
          crud: 'Manage Outbound Emails',
          field:{
                       inboundEmail:'Inbound Email',
           mailbox:'Mailbox',
           user:'User',
           fromEmail:'From Email',
           toEmails:'To Emails',
           ccEmails:'CC Emails',
           bccEmails:'BCC Emails',
           subject:'Subject',
           bodyText:'Plain Text Body',
           bodyHtml:'HTML Body',
           attachments:'Attachments',
           status:'Status',
           messageId:'Message ID',
           inReplyTo:'In Reply To',
           references:'References',
           sentAt:'Sent At',
           lastError:'Last Error',
           attempts:'Attempts'
          }
      },
      permission: {
              'outboundemail:view': 'View Outbound Email',
              'outboundemail:create': 'Create Outbound Email',
              'outboundemail:update': 'Edit Outbound Email',
              'outboundemail:delete': 'Delete Outbound Email',
              'outboundemail:manage': 'Manage Outbound Emails',
      }
  },
  es: {
     outboundemail: {
          entity: 'Correo saliente',
          menu: 'Correos salientes',
          crud: 'Gestionar correos salientes',
          field:{
                       inboundEmail:'Correo entrante',
           mailbox:'Buzón',
           user:'Usuario',
           fromEmail:'Email remitente',
           toEmails:'Destinatarios',
           ccEmails:'Destinatarios en copia',
           bccEmails:'Destinatarios en copia oculta',
           subject:'Asunto',
           bodyText:'Cuerpo en texto plano',
           bodyHtml:'Cuerpo HTML',
           attachments:'Adjuntos',
           status:'Estado',
           messageId:'ID del mensaje',
           inReplyTo:'En respuesta a',
           references:'Referencias',
           sentAt:'Enviado el',
           lastError:'Último error',
           attempts:'Intentos'
          }
      },
     permission: {
              'outboundemail:view': 'Ver correo saliente',
              'outboundemail:create': 'Crear correo saliente',
              'outboundemail:update': 'Editar correo saliente',
              'outboundemail:delete': 'Eliminar correo saliente',
              'outboundemail:manage': 'Gestionar correos salientes',
     }
  }
}

export default messages;  
