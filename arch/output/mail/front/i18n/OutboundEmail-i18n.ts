
const messages = {
  en: {
  
    outboundemail: {
          entity: 'OutboundEmail',
          menu: 'OutboundEmail',
          crud: 'Manage OutboundEmail',
          field:{
                       inboundEmail:'inboundEmail',
           mailbox:'mailbox',
           user:'user',
           fromEmail:'fromEmail',
           toEmails:'toEmails',
           ccEmails:'ccEmails',
           bccEmails:'bccEmails',
           subject:'subject',
           bodyText:'bodyText',
           bodyHtml:'bodyHtml',
           status:'status',
           messageId:'messageId',
           inReplyTo:'inReplyTo',
           references:'references',
           sentAt:'sentAt',
           lastError:'lastError',
           attempts:'attempts'
          }
      },
      permission: {
              'outboundemail:view': 'View OutboundEmail',
              'outboundemail:create': 'Create OutboundEmail',
              'outboundemail:update': 'Edit OutboundEmail',
              'outboundemail:delete': 'Delete OutboundEmail',
              'outboundemail:manage': 'Manage OutboundEmail',
      }
  },
  es: {
     outboundemail: {
          entity: 'OutboundEmail',
          menu: 'OutboundEmail',
          crud: 'Gestionar OutboundEmail',
          field:{
                       inboundEmail:'inboundEmail',
           mailbox:'mailbox',
           user:'user',
           fromEmail:'fromEmail',
           toEmails:'toEmails',
           ccEmails:'ccEmails',
           bccEmails:'bccEmails',
           subject:'subject',
           bodyText:'bodyText',
           bodyHtml:'bodyHtml',
           status:'status',
           messageId:'messageId',
           inReplyTo:'inReplyTo',
           references:'references',
           sentAt:'sentAt',
           lastError:'lastError',
           attempts:'attempts'
          }
      },
     permission: {
              'outboundemail:view': 'Ver OutboundEmail',
              'outboundemail:create': 'Crear OutboundEmail',
              'outboundemail:update': 'Editar OutboundEmail',
              'outboundemail:delete': 'Eliminar OutboundEmail',
              'outboundemail:manage': 'Gestionar OutboundEmail',
     }
  }
}

export default messages;  
