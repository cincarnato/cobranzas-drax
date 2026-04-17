
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IPayerEntity, IPayerEntityBase} from '../interfaces/IPayerEntity'

class PayerEntityProvider extends AbstractCrudRestProvider<IPayerEntity, IPayerEntityBase, IPayerEntityBase> {
    
  static singleton: PayerEntityProvider
    
  constructor() {
   super('/api/payer-entities')
  }
  
  static get instance() {
    if(!PayerEntityProvider.singleton){
      PayerEntityProvider.singleton = new PayerEntityProvider()
    }
    return PayerEntityProvider.singleton
  }

}

export default PayerEntityProvider

