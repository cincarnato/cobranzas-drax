
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITransferEmail, ITransferEmailBase} from '../interfaces/ITransferEmail'

class TransferEmailProvider extends AbstractCrudRestProvider<ITransferEmail, ITransferEmailBase, ITransferEmailBase> {
    
  static singleton: TransferEmailProvider
    
  constructor() {
   super('/api/transfer-emails')
  }
  
  static get instance() {
    if(!TransferEmailProvider.singleton){
      TransferEmailProvider.singleton = new TransferEmailProvider()
    }
    return TransferEmailProvider.singleton
  }

}

export default TransferEmailProvider

