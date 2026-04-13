
const messages = {
  en: {
  
    transferemail: {
          entity: 'TransferEmail',
          menu: 'TransferEmail',
          crud: 'Manage TransferEmail',
          field:{
                       inboundEmail:'inboundEmail',
           isTransferProof:'isTransferProof',
           amount:'amount',
           currency:'currency',
           transferDate:'transferDate',
           operationNumber:'operationNumber',
           concept:'concept',
           originAccount:'originAccount',
           originCbu:'originCbu',
           originAlias:'originAlias',
           originBank:'originBank',
           destinationAccount:'destinationAccount',
           destinationCbu:'destinationCbu',
           destinationAlias:'destinationAlias',
           destinationBank:'destinationBank',
           affiliateName:'affiliateName',
           affiliateEmail:'affiliateEmail',
           affiliateDocumentNumber:'affiliateDocumentNumber',
           needsHumanReview:'needsHumanReview'
          }
      },
      permission: {
              'transferemail:view': 'View TransferEmail',
              'transferemail:create': 'Create TransferEmail',
              'transferemail:update': 'Edit TransferEmail',
              'transferemail:delete': 'Delete TransferEmail',
              'transferemail:manage': 'Manage TransferEmail',
      }
  },
  es: {
     transferemail: {
          entity: 'TransferEmail',
          menu: 'TransferEmail',
          crud: 'Gestionar TransferEmail',
          field:{
                       inboundEmail:'inboundEmail',
           isTransferProof:'isTransferProof',
           amount:'amount',
           currency:'currency',
           transferDate:'transferDate',
           operationNumber:'operationNumber',
           concept:'concept',
           originAccount:'originAccount',
           originCbu:'originCbu',
           originAlias:'originAlias',
           originBank:'originBank',
           destinationAccount:'destinationAccount',
           destinationCbu:'destinationCbu',
           destinationAlias:'destinationAlias',
           destinationBank:'destinationBank',
           affiliateName:'affiliateName',
           affiliateEmail:'affiliateEmail',
           affiliateDocumentNumber:'affiliateDocumentNumber',
           needsHumanReview:'needsHumanReview'
          }
      },
     permission: {
              'transferemail:view': 'Ver TransferEmail',
              'transferemail:create': 'Crear TransferEmail',
              'transferemail:update': 'Editar TransferEmail',
              'transferemail:delete': 'Eliminar TransferEmail',
              'transferemail:manage': 'Gestionar TransferEmail',
     }
  }
}

export default messages;  
