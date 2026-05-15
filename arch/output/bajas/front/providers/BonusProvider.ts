
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

}

export default BonusProvider

