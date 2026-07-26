
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

type TransferSingleInboundEmailProcessResult = {
  inboundEmailId: string
  transferEmails: ITransferEmail[]
  created: number
  existing: number
  skipped: boolean
  reason?: string
  message?: string
  details?: string
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
  payer?: ITransferEmail['payer']
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

  async processInboundEmail(inboundEmailId: string): Promise<TransferSingleInboundEmailProcessResult> {
    return await this.httpClient.post(
      '/api/transfer-emails/process-inbound-email',
      {inboundEmailId},
      {timeout: 300000}
    ) as TransferSingleInboundEmailProcessResult
  }

  async findByInboundEmail(inboundEmailId: string): Promise<ITransferEmail[]> {
    return await this.find({
      filters: [{field: 'inboundEmail', operator: 'eq', value: inboundEmailId}],
      limit: 20
    })
  }

  async reprocess(id: string): Promise<TransferEmailReprocessResult> {
    return await this.httpClient.post(
      `/api/transfer-emails/${id}/reprocess`,
      {},
      {timeout: 300000}
    ) as TransferEmailReprocessResult
  }

  async audit(id: string, payload: Pick<ITransferEmailBase, 'amount' | 'affiliates' | 'humanStatus' | 'transferDate'> & {auditSessionId?: string | null; closeInboundEmail?: boolean}): Promise<ITransferEmail> {
    return await this.httpClient.post(
      `/api/transfer-emails/${id}/audit`,
      payload
    ) as ITransferEmail
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
export type {
  TransferEmailReprocessResult,
  TransferInboundEmailProcessOptions,
  TransferInboundEmailProcessResult,
  TransferSingleInboundEmailProcessResult
}
