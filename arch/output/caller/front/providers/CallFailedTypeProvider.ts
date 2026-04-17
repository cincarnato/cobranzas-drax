
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICallFailedType, ICallFailedTypeBase} from '../interfaces/ICallFailedType'

class CallFailedTypeProvider extends AbstractCrudRestProvider<ICallFailedType, ICallFailedTypeBase, ICallFailedTypeBase> {
    
  static singleton: CallFailedTypeProvider
    
  constructor() {
   super('/api/call-failed-types')
  }
  
  static get instance() {
    if(!CallFailedTypeProvider.singleton){
      CallFailedTypeProvider.singleton = new CallFailedTypeProvider()
    }
    return CallFailedTypeProvider.singleton
  }

}

export default CallFailedTypeProvider

