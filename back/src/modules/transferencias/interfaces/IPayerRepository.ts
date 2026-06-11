
import type {IPayer, IPayerBase, IPayerLookupCriteria} from './IPayer'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IPayerRepository extends IDraxCrudRepository<IPayer, IPayerBase, IPayerBase>{
    findByAnyStrategy(criteria: IPayerLookupCriteria[]): Promise<IPayer[]>
}

export {IPayerRepository}

