
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICallLog, ICallLogBase} from '../interfaces/ICallLog'
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";

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

  async exportExcel(callListId: string): Promise<Response> {
    const authStoreString = localStorage.getItem('AuthStore')
    let accessToken: string | null = null

    if (authStoreString) {
      const authStoreObject = JSON.parse(authStoreString)
      accessToken = authStoreObject.accessToken ?? null
    }

    const query = new URLSearchParams({callListId})

    return fetch(`${this.basePath}/export-excel?${query.toString()}`, {
      method: 'GET',
      headers: accessToken ? {Authorization: `Bearer ${accessToken}`} : undefined,
    })
  }

  async paginateByDataSearch({
    page = 1,
    limit = 5,
    orderBy = "",
    order = "asc",
    search = "",
    filters = []
  }: IDraxPaginateOptions): Promise<IDraxPaginateResult<ICallLog>> {
    const url = this.basePath + '/paginate-data-search'
    const params = {page, limit, orderBy, order, search, filters: this.prepareFilters(filters)}
    const paginatedItems = await this.httpClient.get(url, {params})
    return paginatedItems as IDraxPaginateResult<ICallLog>
  }

}

export default CallLogProvider
