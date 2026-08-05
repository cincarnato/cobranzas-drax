
const messages = {
  en: {
  
    templateemail: {
          entity: 'TemplateEmail',
          menu: 'TemplateEmail',
          crud: 'Manage TemplateEmail',
          field:{
                       mailbox:'mailbox',
           name:'name',
           content:'content'
          }
      },
      permission: {
              'templateemail:view': 'View TemplateEmail',
              'templateemail:create': 'Create TemplateEmail',
              'templateemail:update': 'Edit TemplateEmail',
              'templateemail:delete': 'Delete TemplateEmail',
              'templateemail:manage': 'Manage TemplateEmail',
      }
  },
  es: {
     templateemail: {
          entity: 'TemplateEmail',
          menu: 'TemplateEmail',
          crud: 'Gestionar TemplateEmail',
          field:{
                       mailbox:'mailbox',
           name:'name',
           content:'content'
          }
      },
     permission: {
              'templateemail:view': 'Ver TemplateEmail',
              'templateemail:create': 'Crear TemplateEmail',
              'templateemail:update': 'Editar TemplateEmail',
              'templateemail:delete': 'Eliminar TemplateEmail',
              'templateemail:manage': 'Gestionar TemplateEmail',
     }
  }
}

export default messages;  
