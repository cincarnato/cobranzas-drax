
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IBankMovement, IBankMovementBase} from '../interfaces/IBankMovement'

class BankMovementProvider extends AbstractCrudRestProvider<IBankMovement, IBankMovementBase, IBankMovementBase> {
    
  static singleton: BankMovementProvider
    
  constructor() {
   super('/api/bank-movements')
  }
  
  static get instance() {
    if(!BankMovementProvider.singleton){
      BankMovementProvider.singleton = new BankMovementProvider()
    }
    return BankMovementProvider.singleton
  }

}

export default BankMovementProvider

