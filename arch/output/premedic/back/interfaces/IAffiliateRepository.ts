
import type {IAffiliate, IAffiliateBase} from './IAffiliate'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IAffiliateRepository extends IDraxCrudRepository<IAffiliate, IAffiliateBase, IAffiliateBase>{

}

export {IAffiliateRepository}


