
const messages = {
  en: {
  
    mailboxusersetting: {
          entity: 'Mailbox user setting',
          menu: 'Mailbox user settings',
          crud: 'Manage mailbox user settings',
          field:{
                       mailbox:'Mailbox',
           user:'User',
           signatureHtml:'Signature HTML',
           signatureText:'Signature text',
           autoAdvanceOnClose:'Auto advance on close'
          }
      },
      permission: {
              'mailboxusersetting:view': 'View mailbox user settings',
              'mailboxusersetting:create': 'Create mailbox user settings',
              'mailboxusersetting:update': 'Edit mailbox user settings',
              'mailboxusersetting:delete': 'Delete mailbox user settings',
              'mailboxusersetting:manage': 'Manage mailbox user settings',
      }
  },
  es: {
     mailboxusersetting: {
          entity: 'Configuracion de usuario por mailbox',
          menu: 'Configuraciones de usuario por mailbox',
          crud: 'Gestionar configuraciones de usuario por mailbox',
          field:{
                       mailbox:'Mailbox',
           user:'Usuario',
           signatureHtml:'Firma HTML',
           signatureText:'Firma texto',
           autoAdvanceOnClose:'Avanzar automaticamente al cerrar'
          }
      },
     permission: {
              'mailboxusersetting:view': 'Ver configuraciones de usuario por mailbox',
              'mailboxusersetting:create': 'Crear configuraciones de usuario por mailbox',
              'mailboxusersetting:update': 'Editar configuraciones de usuario por mailbox',
              'mailboxusersetting:delete': 'Eliminar configuraciones de usuario por mailbox',
              'mailboxusersetting:manage': 'Gestionar configuraciones de usuario por mailbox',
     }
  }
}

export default messages;  
