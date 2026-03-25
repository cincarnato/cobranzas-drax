
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICallList, ICallListBase} from '../interfaces/ICallList'

class CallListProvider extends AbstractCrudRestProvider<ICallList, ICallListBase, ICallListBase> {
    
  static singleton: CallListProvider
    
  constructor() {
   super('/api/call-lists')
  }
  
  static get instance() {
    if(!CallListProvider.singleton){
      CallListProvider.singleton = new CallListProvider()
    }
    return CallListProvider.singleton
  }

}

export default CallListProvider

