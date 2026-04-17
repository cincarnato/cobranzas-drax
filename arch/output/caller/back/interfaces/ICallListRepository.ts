
import type {ICallList, ICallListBase} from './ICallList'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ICallListRepository extends IDraxCrudRepository<ICallList, ICallListBase, ICallListBase>{

}

export {ICallListRepository}


