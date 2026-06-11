
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITransferEmail, ITransferEmailBase} from '../interfaces/ITransferEmail'
import type {IDraxFindOptions} from "@drax/crud-share";

type TransferInboundEmailProcessResult = {
  since: string | null
  limit: number
  scanned: number
  created: number
  skipped: number
}

type TransferInboundEmailProcessOptions = {
  since?: string | null
  limit?: number | null
}

type TransferEmailReprocessResult = {
  transferEmail: ITransferEmail
  previousTransferEmail: ITransferEmail
  updatedFields: ITransferEmailBase
  changes?: Array<{
    field: string
    label: string
    before: string
    after: string
  }>
  changed: boolean
  payerFound: boolean
  payerStrategy?: ITransferEmail['affiliateStrategy']
  previousAffiliateStrategy?: ITransferEmail['affiliateStrategy']
  currentAffiliateStrategy?: ITransferEmail['affiliateStrategy']
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

  async processInboundEmails(options: TransferInboundEmailProcessOptions = {}): Promise<TransferInboundEmailProcessResult> {
    return await this.httpClient.post(
      '/api/transfer-emails/process-inbound-emails',
      options,
      {timeout: 300000}
    ) as TransferInboundEmailProcessResult
  }

  async reprocess(id: string): Promise<TransferEmailReprocessResult> {
    return await this.httpClient.post(
      `/api/transfer-emails/${id}/reprocess`,
      {},
      {timeout: 300000}
    ) as TransferEmailReprocessResult
  }

  async exportExcel({orderBy = "", order = "asc", search = "", filters = []}: IDraxFindOptions): Promise<Response> {
    const authStoreString = localStorage.getItem('AuthStore')
    let accessToken: string | null = null

    if (authStoreString) {
      const authStoreObject = JSON.parse(authStoreString)
      accessToken = authStoreObject.accessToken ?? null
    }

    const query = new URLSearchParams({
      orderBy,
      order: String(order),
      search,
      filters: this.prepareFilters(filters)
    })

    return fetch(`${this.basePath}/export-excel?${query.toString()}`, {
      method: 'GET',
      headers: accessToken ? {Authorization: `Bearer ${accessToken}`} : undefined,
    })
  }

}

export default TransferEmailProvider
export type {TransferEmailReprocessResult, TransferInboundEmailProcessOptions, TransferInboundEmailProcessResult}
