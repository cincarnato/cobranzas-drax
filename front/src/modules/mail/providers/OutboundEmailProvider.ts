
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IOutboundEmail, IOutboundEmailBase} from '../interfaces/IOutboundEmail'

type StandaloneOutboundEmailResult = {
  items: IOutboundEmail[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

class OutboundEmailProvider extends AbstractCrudRestProvider<IOutboundEmail, IOutboundEmailBase, IOutboundEmailBase> {
    
  static singleton: OutboundEmailProvider
    
  constructor() {
   super('/api/outbound-emails')
  }
  
  static get instance() {
    if(!OutboundEmailProvider.singleton){
      OutboundEmailProvider.singleton = new OutboundEmailProvider()
    }
    return OutboundEmailProvider.singleton
  }

  async standalone(mailboxId: string, page = 1, pageSize = 25): Promise<StandaloneOutboundEmailResult> {
    return await this.httpClient.get('/api/outbound-emails/standalone', {
      params: {mailboxId, page, pageSize}
    }) as StandaloneOutboundEmailResult
  }

}

export default OutboundEmailProvider
export type {StandaloneOutboundEmailResult}
