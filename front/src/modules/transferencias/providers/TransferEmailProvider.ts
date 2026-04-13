
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITransferEmail, ITransferEmailBase} from '../interfaces/ITransferEmail'

type TransferInboundEmailProcessResult = {
  since: string | null
  scanned: number
  created: number
  skipped: number
}

class TransferEmailProvider extends AbstractCrudRestProvider<ITransferEmail, ITransferEmailBase, ITransferEmailBase> {
    
  static singleton: TransferEmailProvider
    
  constructor() {
   super('/api/transfer-emails')
  }
  
  static get instance() {
    if(!TransferEmailProvider.singleton){
      TransferEmailProvider.singleton = new TransferEmailProvider()
    }
    return TransferEmailProvider.singleton
  }

  async processInboundEmails(): Promise<TransferInboundEmailProcessResult> {
    return await this.httpClient.post(
      '/api/transfer-emails/process-inbound-emails',
      {},
      {timeout: 300000}
    ) as TransferInboundEmailProcessResult
  }

}

export default TransferEmailProvider
export type {TransferInboundEmailProcessResult}
