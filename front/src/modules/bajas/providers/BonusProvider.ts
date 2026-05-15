
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IBonus, IBonusBase} from '../interfaces/IBonus'

class BonusProvider extends AbstractCrudRestProvider<IBonus, IBonusBase, IBonusBase> {
    
  static singleton: BonusProvider
    
  constructor() {
   super('/api/bonuses')
  }
  
  static get instance() {
    if(!BonusProvider.singleton){
      BonusProvider.singleton = new BonusProvider()
    }
    return BonusProvider.singleton
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

export default BonusProvider
