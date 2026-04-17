
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICovenant, ICovenantBase} from '../interfaces/ICovenant'

class CovenantProvider extends AbstractCrudRestProvider<ICovenant, ICovenantBase, ICovenantBase> {
    
  static singleton: CovenantProvider
    
  constructor() {
   super('/api/covenants')
  }
  
  static get instance() {
    if(!CovenantProvider.singleton){
      CovenantProvider.singleton = new CovenantProvider()
    }
    return CovenantProvider.singleton
  }

}

export default CovenantProvider

