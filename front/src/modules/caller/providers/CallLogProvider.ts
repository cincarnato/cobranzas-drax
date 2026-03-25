
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

  async registerAttempt(id: string, payload: Pick<ICallLogBase, 'notes' | 'typification' | 'state' | 'promiseDate' | 'done'>): Promise<ICallLog> {
    const url = this.basePath + '/' + id + '/attempts'
    const item = await this.httpClient.post(url, payload)
    return item as ICallLog
  }

}

export default CallLogProvider
