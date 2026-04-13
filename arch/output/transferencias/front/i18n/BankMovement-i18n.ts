
const messages = {
  en: {
  
    bankmovement: {
          entity: 'BankMovement',
          menu: 'BankMovement',
          crud: 'Manage BankMovement',
          field:{
                       Fecha:'Fecha',
           Concepto:'Concepto',
           NroCpbte:'NroCpbte',
           Debito:'Debito',
           Credito:'Credito',
           Saldo:'Saldo',
           Cod:'Cod',
           fecha:'fecha',
           importe:'importe',
           direccion:'direccion',
           tipoConcepto:'tipoConcepto',
           bancoOrigen:'bancoOrigen',
           cuilCuitPagador:'cuilCuitPagador',
           nombrePagador:'nombrePagador',
           numeroCuentaPagador:'numeroCuentaPagador',
           pagadorDetectadoId:'pagadorDetectadoId',
           afiliadoId:'afiliadoId',
           estado:'estado'
          }
      },
      permission: {
              'bankmovement:view': 'View BankMovement',
              'bankmovement:create': 'Create BankMovement',
              'bankmovement:update': 'Edit BankMovement',
              'bankmovement:delete': 'Delete BankMovement',
              'bankmovement:manage': 'Manage BankMovement',
      }
  },
  es: {
     bankmovement: {
          entity: 'BankMovement',
          menu: 'BankMovement',
          crud: 'Gestionar BankMovement',
          field:{
                       Fecha:'Fecha',
           Concepto:'Concepto',
           NroCpbte:'NroCpbte',
           Debito:'Debito',
           Credito:'Credito',
           Saldo:'Saldo',
           Cod:'Cod',
           fecha:'fecha',
           importe:'importe',
           direccion:'direccion',
           tipoConcepto:'tipoConcepto',
           bancoOrigen:'bancoOrigen',
           cuilCuitPagador:'cuilCuitPagador',
           nombrePagador:'nombrePagador',
           numeroCuentaPagador:'numeroCuentaPagador',
           pagadorDetectadoId:'pagadorDetectadoId',
           afiliadoId:'afiliadoId',
           estado:'estado'
          }
      },
     permission: {
              'bankmovement:view': 'Ver BankMovement',
              'bankmovement:create': 'Crear BankMovement',
              'bankmovement:update': 'Editar BankMovement',
              'bankmovement:delete': 'Eliminar BankMovement',
              'bankmovement:manage': 'Gestionar BankMovement',
     }
  }
}

export default messages;  
