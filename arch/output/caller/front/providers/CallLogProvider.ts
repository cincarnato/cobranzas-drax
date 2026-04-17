
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICallLog, ICallLogBase} from '../interfaces/ICallLog'

class CallLogProvider extends AbstractCrudRestProvider<ICallLog, ICallLogBase, ICallLogBase> {
    
  static singleton: CallLogProvider
    
  constructor() {
   super('/api/call-logs')
  }
  
  static get instance() {
    if(!CallLogProvider.singleton){
      CallLogProvider.singleton = new CallLogProvider()
    }
    return CallLogProvider.singleton
  }

}

export default CallLogProvider

