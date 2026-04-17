
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IAffiliateType, IAffiliateTypeBase} from '../interfaces/IAffiliateType'

class AffiliateTypeProvider extends AbstractCrudRestProvider<IAffiliateType, IAffiliateTypeBase, IAffiliateTypeBase> {
    
  static singleton: AffiliateTypeProvider
    
  constructor() {
   super('/api/affiliate-types')
  }
  
  static get instance() {
    if(!AffiliateTypeProvider.singleton){
      AffiliateTypeProvider.singleton = new AffiliateTypeProvider()
    }
    return AffiliateTypeProvider.singleton
  }

}

export default AffiliateTypeProvider

