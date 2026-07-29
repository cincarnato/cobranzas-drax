
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

}

export default InternalTransferBonusProvider

