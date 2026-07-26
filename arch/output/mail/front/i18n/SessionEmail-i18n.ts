
const messages = {
  en: {
  
    sessionemail: {
          entity: 'SessionEmail',
          menu: 'SessionEmail',
          crud: 'Manage SessionEmail',
          field:{
                       mailbox:'mailbox',
           user:'user',
           status:'status',
           startedAt:'startedAt',
           pausedAt:'pausedAt',
           endedAt:'endedAt',
           lastActivityAt:'lastActivityAt',
           maxAssignableEmails:'maxAssignableEmails',
           assignedCount:'assignedCount',
           repliedCount:'repliedCount',
           closedCount:'closedCount',
           capacityFillLockedUntil:'capacityFillLockedUntil'
          }
      },
      permission: {
              'sessionemail:view': 'View SessionEmail',
              'sessionemail:create': 'Create SessionEmail',
              'sessionemail:update': 'Edit SessionEmail',
              'sessionemail:delete': 'Delete SessionEmail',
              'sessionemail:manage': 'Manage SessionEmail',
      }
  },
  es: {
     sessionemail: {
          entity: 'SessionEmail',
          menu: 'SessionEmail',
          crud: 'Gestionar SessionEmail',
          field:{
                       mailbox:'mailbox',
           user:'user',
           status:'status',
           startedAt:'startedAt',
           pausedAt:'pausedAt',
           endedAt:'endedAt',
           lastActivityAt:'lastActivityAt',
           maxAssignableEmails:'maxAssignableEmails',
           assignedCount:'assignedCount',
           repliedCount:'repliedCount',
           closedCount:'closedCount',
           capacityFillLockedUntil:'capacityFillLockedUntil'
          }
      },
     permission: {
              'sessionemail:view': 'Ver SessionEmail',
              'sessionemail:create': 'Crear SessionEmail',
              'sessionemail:update': 'Editar SessionEmail',
              'sessionemail:delete': 'Eliminar SessionEmail',
              'sessionemail:manage': 'Gestionar SessionEmail',
     }
  }
}

export default messages;  
