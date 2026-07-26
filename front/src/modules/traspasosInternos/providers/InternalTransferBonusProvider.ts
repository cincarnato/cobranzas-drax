
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IInternalTransferBonus, IInternalTransferBonusBase} from '../interfaces/IInternalTransferBonus'

class InternalTransferBonusProvider extends AbstractCrudRestProvider<IInternalTransferBonus, IInternalTransferBonusBase, IInternalTransferBonusBase> {
    
  static singleton: InternalTransferBonusProvider
    
  constructor() {
   super('/api/internal-transfer-bonuses')
  }
  
  static get instance() {
    if(!InternalTransferBonusProvider.singleton){
      InternalTransferBonusProvider.singleton = new InternalTransferBonusProvider()
    }
    return InternalTransferBonusProvider.singleton
  }

  async exportExcel(from: string, to: string, operator?: string): Promise<Response> {
    const authStoreString = localStorage.getItem('AuthStore')
    let accessToken: string | null = null

    if (authStoreString) {
      const authStoreObject = JSON.parse(authStoreString)
      accessToken = authStoreObject.accessToken ?? null
    }

    const query = new URLSearchParams({from, to})

    if (operator) {
      query.set('operator', operator)
    }

    return fetch(`${this.basePath}/export-excel?${query.toString()}`, {
      method: 'GET',
      headers: accessToken ? {Authorization: `Bearer ${accessToken}`} : undefined,
    })
  }

}

export default InternalTransferBonusProvider
