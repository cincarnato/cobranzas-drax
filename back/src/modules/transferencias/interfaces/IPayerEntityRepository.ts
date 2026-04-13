
import type {IPayerEntity, IPayerEntityBase} from './IPayerEntity'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IPayerEntityRepository extends IDraxCrudRepository<IPayerEntity, IPayerEntityBase, IPayerEntityBase>{

}

export {IPayerEntityRepository}


