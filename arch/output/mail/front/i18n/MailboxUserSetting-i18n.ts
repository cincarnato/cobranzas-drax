
const messages = {
  en: {
  
    mailboxusersetting: {
          entity: 'MailboxUserSetting',
          menu: 'MailboxUserSetting',
          crud: 'Manage MailboxUserSetting',
          field:{
                       mailbox:'mailbox',
           user:'user',
           signatureHtml:'signatureHtml',
           signatureText:'signatureText'
          }
      },
      permission: {
              'mailboxusersetting:view': 'View MailboxUserSetting',
              'mailboxusersetting:create': 'Create MailboxUserSetting',
              'mailboxusersetting:update': 'Edit MailboxUserSetting',
              'mailboxusersetting:delete': 'Delete MailboxUserSetting',
              'mailboxusersetting:manage': 'Manage MailboxUserSetting',
      }
  },
  es: {
     mailboxusersetting: {
          entity: 'MailboxUserSetting',
          menu: 'MailboxUserSetting',
          crud: 'Gestionar MailboxUserSetting',
          field:{
                       mailbox:'mailbox',
           user:'user',
           signatureHtml:'signatureHtml',
           signatureText:'signatureText'
          }
      },
     permission: {
              'mailboxusersetting:view': 'Ver MailboxUserSetting',
              'mailboxusersetting:create': 'Crear MailboxUserSetting',
              'mailboxusersetting:update': 'Editar MailboxUserSetting',
              'mailboxusersetting:delete': 'Eliminar MailboxUserSetting',
              'mailboxusersetting:manage': 'Gestionar MailboxUserSetting',
     }
  }
}

export default messages;  
