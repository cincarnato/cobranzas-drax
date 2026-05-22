import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICallAttempt, ICallAttemptBase} from '../interfaces/ICallAttempt'

class CallAttemptProvider extends AbstractCrudRestProvider<ICallAttempt, ICallAttemptBase, ICallAttemptBase> {

  static singleton: CallAttemptProvider

  constructor() {
    super('/api/call-attempts')
  }

  static get instance() {
    if(!CallAttemptProvider.singleton){
      CallAttemptProvider.singleton = new CallAttemptProvider()
    }
    return CallAttemptProvider.singleton
  }

}

export default CallAttemptProvider
