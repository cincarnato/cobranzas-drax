
const messages = {
  en: {
  
    mailbox: {
          entity: 'Mailbox',
          menu: 'Mailbox',
          crud: 'Manage Mailbox',
          field:{
                       name:'name',
           email:'email',
           username:'username',
           password:'password',
           isActive:'isActive',
           autoProcessEnabled:'autoProcessEnabled',
           processingProtocol:'processingProtocol',
           processingIntervalMinutes:'processingIntervalMinutes',
           imapEnabled:'imapEnabled',
           imapHost:'imapHost',
           imapPort:'imapPort',
           imapTls:'imapTls',
           popEnabled:'popEnabled',
           popHost:'popHost',
           popPort:'popPort',
           popTls:'popTls',
           smtpEnabled:'smtpEnabled',
           smtpHost:'smtpHost',
           smtpPort:'smtpPort',
           smtpTls:'smtpTls'
          }
      },
      permission: {
              'mailbox:view': 'View Mailbox',
              'mailbox:create': 'Create Mailbox',
              'mailbox:update': 'Edit Mailbox',
              'mailbox:delete': 'Delete Mailbox',
              'mailbox:manage': 'Manage Mailbox',
      }
  },
  es: {
     mailbox: {
          entity: 'Mailbox',
          menu: 'Mailbox',
          crud: 'Gestionar Mailbox',
          field:{
                       name:'name',
           email:'email',
           username:'username',
           password:'password',
           isActive:'isActive',
           autoProcessEnabled:'autoProcessEnabled',
           processingProtocol:'processingProtocol',
           processingIntervalMinutes:'processingIntervalMinutes',
           imapEnabled:'imapEnabled',
           imapHost:'imapHost',
           imapPort:'imapPort',
           imapTls:'imapTls',
           popEnabled:'popEnabled',
           popHost:'popHost',
           popPort:'popPort',
           popTls:'popTls',
           smtpEnabled:'smtpEnabled',
           smtpHost:'smtpHost',
           smtpPort:'smtpPort',
           smtpTls:'smtpTls'
          }
      },
     permission: {
              'mailbox:view': 'Ver Mailbox',
              'mailbox:create': 'Crear Mailbox',
              'mailbox:update': 'Editar Mailbox',
              'mailbox:delete': 'Eliminar Mailbox',
              'mailbox:manage': 'Gestionar Mailbox',
     }
  }
}

export default messages;  
