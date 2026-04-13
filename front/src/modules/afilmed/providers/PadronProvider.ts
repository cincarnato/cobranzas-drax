
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IPadron, IPadronBase} from '../interfaces/IPadron'

class PadronProvider extends AbstractCrudRestProvider<IPadron, IPadronBase, IPadronBase> {
    
  static singleton: PadronProvider
    
  constructor() {
   super('/api/padrones')
  }
  
  static get instance() {
    if(!PadronProvider.singleton){
      PadronProvider.singleton = new PadronProvider()
    }
    return PadronProvider.singleton
  }

}

export default PadronProvider

