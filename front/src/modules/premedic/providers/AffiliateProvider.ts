
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IAffiliate, IAffiliateBase} from '../interfaces/IAffiliate'

class AffiliateProvider extends AbstractCrudRestProvider<IAffiliate, IAffiliateBase, IAffiliateBase> {
    
  static singleton: AffiliateProvider
    
  constructor() {
   super('/api/affiliates')
  }
  
  static get instance() {
    if(!AffiliateProvider.singleton){
      AffiliateProvider.singleton = new AffiliateProvider()
    }
    return AffiliateProvider.singleton
  }

}

export default AffiliateProvider

