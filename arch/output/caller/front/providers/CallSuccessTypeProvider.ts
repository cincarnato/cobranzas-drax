
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICallSuccessType, ICallSuccessTypeBase} from '../interfaces/ICallSuccessType'

class CallSuccessTypeProvider extends AbstractCrudRestProvider<ICallSuccessType, ICallSuccessTypeBase, ICallSuccessTypeBase> {
    
  static singleton: CallSuccessTypeProvider
    
  constructor() {
   super('/api/call-success-types')
  }
  
  static get instance() {
    if(!CallSuccessTypeProvider.singleton){
      CallSuccessTypeProvider.singleton = new CallSuccessTypeProvider()
    }
    return CallSuccessTypeProvider.singleton
  }

}

export default CallSuccessTypeProvider

