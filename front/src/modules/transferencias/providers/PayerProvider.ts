
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IPayer, IPayerBase} from '../interfaces/IPayer'

class PayerProvider extends AbstractCrudRestProvider<IPayer, IPayerBase, IPayerBase> {
    
  static singleton: PayerProvider
    
  constructor() {
   super('/api/payers')
  }
  
  static get instance() {
    if(!PayerProvider.singleton){
      PayerProvider.singleton = new PayerProvider()
    }
    return PayerProvider.singleton
  }

}

export default PayerProvider

